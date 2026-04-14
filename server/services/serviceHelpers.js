import Group from "../models/Group.js";
import GroupMembership from "../models/GroupMembership.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Workflow from "../models/Workflow.js";

export const createServiceError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const ensureEntityInOrg = async (Model, notFoundMessage, { organizationId, entityId }) => {
  const entity = await Model.findOne({ _id: entityId, organizationId });
  if (!entity) {
    throw createServiceError(404, notFoundMessage);
  }
  return entity;
};

export const ensureTaskInOrg = ({ notFoundMessage = "Task not found", ...args }) =>
  ensureEntityInOrg(Task, notFoundMessage, { ...args, entityId: args.taskId });

export const ensureWorkflowInOrg = ({ notFoundMessage = "Workflow not found", ...args }) =>
  ensureEntityInOrg(Workflow, notFoundMessage, { ...args, entityId: args.workflowId });

export const ensureGroupInOrg = ({ notFoundMessage = "Group not found", ...args }) =>
  ensureEntityInOrg(Group, notFoundMessage, { ...args, entityId: args.groupId });

export const ensureUserInOrg = ({ notFoundMessage = "User not found", ...args }) =>
  ensureEntityInOrg(User, notFoundMessage, { ...args, entityId: args.userId });

export const selectLeastLoadedGroupMember = async ({
  organizationId,
  groupId,
  noMembersMessage = "No active members available in the assigned team",
}) => {
  const memberships = await GroupMembership.find({
    organizationId,
    groupId,
    isActive: true,
  }).populate("userId", "isActive");

  const activeMembers = memberships.filter((membership) => membership.userId?.isActive);
  if (!activeMembers.length) {
    throw createServiceError(400, noMembersMessage);
  }

  const loadEntries = await Promise.all(
    activeMembers.map(async (membership) => ({
      membership,
      load: await Task.countDocuments({
        organizationId,
        assignedTo: membership.userId._id,
        status: { $in: ["pending", "in_progress", "blocked"] },
      }),
    }))
  );

  loadEntries.sort((a, b) => {
    if (a.load !== b.load) return a.load - b.load;
    return new Date(a.membership.createdAt) - new Date(b.membership.createdAt);
  });

  return loadEntries[0].membership;
};
