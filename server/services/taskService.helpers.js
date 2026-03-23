import Group from "../models/Group.js";
import GroupMembership from "../models/GroupMembership.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Workflow from "../models/Workflow.js";
import { emitTaskNotification } from "./notificationService.js";

export const createServiceError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const ensureTaskInOrg = async ({ organizationId, taskId }) => {
  const task = await Task.findOne({ _id: taskId, organizationId });
  if (!task) {
    throw createServiceError(404, "Task not found");
  }
  return task;
};

export const ensureWorkflowInOrg = async ({ organizationId, workflowId }) => {
  const workflow = await Workflow.findOne({ _id: workflowId, organizationId });
  if (!workflow) {
    throw createServiceError(404, "Workflow not found");
  }
  return workflow;
};

export const ensureGroupInOrg = async ({ organizationId, groupId }) => {
  const group = await Group.findOne({ _id: groupId, organizationId });
  if (!group) {
    throw createServiceError(404, "Group not found");
  }
  return group;
};

export const ensureUserInOrg = async ({ organizationId, userId }) => {
  const user = await User.findOne({ _id: userId, organizationId });
  if (!user) {
    throw createServiceError(404, "User not found");
  }
  return user;
};

export const ensureActiveGroupMember = async ({ organizationId, groupId, userId }) => {
  const membership = await GroupMembership.findOne({
    organizationId,
    groupId,
    userId,
    isActive: true,
  });
  if (!membership) {
    throw createServiceError(400, "User is not an active member of the assigned group");
  }
  return membership;
};

export const canRequesterManualAssign = async ({
  organizationId,
  requesterId,
  requesterRole,
  groupId,
}) => {
  if (requesterRole === "admin") return true;
  if (!groupId || !requesterId) return false;

  const membership = await GroupMembership.findOne({
    organizationId,
    groupId,
    userId: requesterId,
    isActive: true,
  }).select("roleInGroup");

  return membership?.roleInGroup === "group_admin";
};

export const selectLeastLoadedGroupMember = async ({ organizationId, groupId }) => {
  const memberships = await GroupMembership.find({
    organizationId,
    groupId,
    isActive: true,
  }).populate("userId", "isActive");

  const activeMembers = memberships.filter((m) => m.userId?.isActive);
  if (!activeMembers.length) {
    throw createServiceError(400, "No active members available in the assigned group");
  }

  const loadEntries = await Promise.all(
    activeMembers.map(async (membership) => {
      const openTasks = await Task.countDocuments({
        organizationId,
        assignedTo: membership.userId._id,
        status: { $in: ["pending", "in_progress", "blocked"] },
      });

      return { membership, load: openTasks };
    })
  );

  loadEntries.sort((a, b) => {
    if (a.load !== b.load) return a.load - b.load;
    return new Date(a.membership.createdAt) - new Date(b.membership.createdAt);
  });

  return loadEntries[0].membership;
};

const getGroupAdminsAndSupervisors = async ({ organizationId, groupId }) => {
  if (!groupId) return [];
  const memberships = await GroupMembership.find({
    organizationId,
    groupId,
    isActive: true,
    roleInGroup: { $in: ["group_admin", "supervisor"] },
  }).select("userId");
  return memberships.map((membership) => membership.userId);
};

export const canRequesterCompleteStage = async ({
  organizationId,
  requesterId,
  requesterRole,
  assignedGroupId,
  assignedTo,
}) => {
  if (requesterRole === "admin") return true;
  if (assignedTo && String(assignedTo) === String(requesterId)) return true;
  if (!assignedGroupId) return false;

  const membership = await GroupMembership.findOne({
    organizationId,
    groupId: assignedGroupId,
    userId: requesterId,
    isActive: true,
  }).select("roleInGroup");

  return membership?.roleInGroup === "group_admin" || membership?.roleInGroup === "supervisor";
};

export const notifyTaskReachedGroupStage = async ({ task, stageName, groupId, assigneeId }) => {
  const groupLeads = await getGroupAdminsAndSupervisors({
    organizationId: task.organizationId,
    groupId,
  });

  await emitTaskNotification({
    organizationId: task.organizationId,
    taskId: task._id,
    type: "stage_reached",
    recipientGroupId: groupId,
    message: `Task "${task.title}" reached stage "${stageName}"`,
  });

  if (assigneeId) {
    await emitTaskNotification({
      organizationId: task.organizationId,
      taskId: task._id,
      type: "task_assigned",
      recipientUserIds: [assigneeId],
      message: `You have been assigned task "${task.title}" for stage "${stageName}"`,
    });
  }

  if (groupLeads.length) {
    await emitTaskNotification({
      organizationId: task.organizationId,
      taskId: task._id,
      type: "manual_assignment_available",
      recipientUserIds: groupLeads,
      message: `Manual reassignment is available for task "${task.title}"`,
    });
  }
};

export const resolveWorkflowStage = ({ workflow, stageName }) => {
  const sortedStages = [...(workflow.stages || [])].sort((a, b) => a.order - b.order);
  if (!sortedStages.length) {
    throw createServiceError(400, "Workflow has no stages");
  }

  if (!stageName) {
    return sortedStages[0];
  }

  const normalized = stageName.trim().toLowerCase();
  const matched = sortedStages.find((stage) => stage.name.toLowerCase() === normalized);
  if (!matched) {
    throw createServiceError(400, "Provided stageName does not exist in the workflow");
  }
  return matched;
};

export const buildTaskQuery = ({ organizationId, status, workflowId, assignedTo, onlyMine, userId }) => {
  const query = { organizationId };
  if (status) query.status = status;
  if (workflowId) query.workflowId = workflowId;
  if (assignedTo) query.assignedTo = assignedTo;
  if (onlyMine) query.assignedTo = userId;
  return query;
};
