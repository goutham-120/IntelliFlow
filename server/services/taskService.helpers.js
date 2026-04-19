import GroupMembership from "../models/GroupMembership.js";
import { emitTaskNotification } from "./notificationService.js";
import {
  createServiceError,
  ensureGroupInOrg,
  ensureTaskInOrg,
  ensureUserInOrg,
  ensureWorkflowInOrg,
  selectLeastLoadedGroupMember,
} from "./serviceHelpers.js";

export const ensureActiveGroupMember = async ({ organizationId, groupId, userId }) => {
  const membership = await GroupMembership.findOne({
    organizationId,
    groupId,
    userId,
    isActive: true,
  });
  if (!membership) {
    throw createServiceError(400, "User is not an active member of the assigned team");
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

  return membership?.roleInGroup === "team_lead";
};

const getTeamLeads = async ({ organizationId, groupId }) => {
  if (!groupId) return [];
  const memberships = await GroupMembership.find({
    organizationId,
    groupId,
    isActive: true,
    roleInGroup: "team_lead",
  }).select("userId");
  return memberships.map((membership) => membership.userId);
};

export const canRequesterCompleteStage = async ({
  organizationId,
  requesterId,
  requesterRole,
  assignedTo,
}) => {
  void organizationId;
  void requesterRole;
  return Boolean(assignedTo && String(assignedTo) === String(requesterId));
};

export const notifyTaskReachedGroupStage = async ({ task, stageName, groupId, assigneeId }) => {
  const teamLeads = await getTeamLeads({
    organizationId: task.organizationId,
    groupId,
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

  if (teamLeads.length) {
    await emitTaskNotification({
      organizationId: task.organizationId,
      taskId: task._id,
      type: "team_stage_ready",
      recipientUserIds: teamLeads,
      message: `Task "${task.title}" is now in your team's stage "${stageName}"`,
    });
  }
};

export const getSortedWorkflowStages = (workflow) => {
  const sortedStages = [...(workflow.stages || [])].sort((a, b) => a.order - b.order);
  if (!sortedStages.length) {
    throw createServiceError(400, "Workflow has no stages");
  }
  return sortedStages;
};

export const resolveWorkflowStage = ({ workflow, stageName, stageOrder }) => {
  const sortedStages = getSortedWorkflowStages(workflow);

  if (stageOrder !== undefined && stageOrder !== null) {
    const matchedByOrder = sortedStages.find((stage) => stage.order === Number(stageOrder));
    if (!matchedByOrder) {
      throw createServiceError(400, "Provided stageOrder does not exist in the workflow");
    }
    return matchedByOrder;
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

export const resolveTaskWorkflowStage = ({ workflow, task }) => {
  const stages = getSortedWorkflowStages(workflow);
  const normalizedStageName = String(task.stageName || "").trim().toLowerCase();
  const numericStageOrder =
    task.stageOrder === undefined || task.stageOrder === null ? null : Number(task.stageOrder);

  let currentStageIndex = -1;
  if (numericStageOrder !== null && !Number.isNaN(numericStageOrder)) {
    currentStageIndex = stages.findIndex((stage) => stage.order === numericStageOrder);
  }

  if (currentStageIndex < 0 && normalizedStageName) {
    currentStageIndex = stages.findIndex(
      (stage) => stage.name.toLowerCase() === normalizedStageName
    );
  }

  if (currentStageIndex < 0) {
    throw createServiceError(400, "Current task stage is invalid for this workflow");
  }

  return {
    stages,
    currentStageIndex,
    currentStage: stages[currentStageIndex],
  };
};

export const buildTaskQuery = ({ organizationId, status, workflowId, assignedTo, onlyMine, userId }) => {
  const query = { organizationId };
  if (status) query.status = status;
  if (workflowId) query.workflowId = workflowId;
  if (assignedTo) query.assignedTo = assignedTo;
  if (onlyMine) query.assignedTo = userId;
  return query;
};
