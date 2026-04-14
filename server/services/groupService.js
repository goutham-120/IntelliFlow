import Group from "../models/Group.js";
import GroupMembership from "../models/GroupMembership.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import {
  createServiceError,
  ensureGroupInOrg,
  ensureUserInOrg,
  selectLeastLoadedGroupMember,
} from "./serviceHelpers.js";

export const createGroupService = async ({
  organizationId,
  name,
  code,
  description,
}) => {
  try {
    const group = await Group.create({
      organizationId,
      name,
      code,
      description,
    });

    return {
      status: 201,
      payload: {
        message: "Team created successfully",
        group,
      },
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw createServiceError(400, "Group with same name/code already exists");
    }
    throw error;
  }
};

export const getGroupsService = async ({ organizationId }) => {
  const groups = await Group.find({ organizationId }).sort({ createdAt: -1 });
  return {
    status: 200,
    payload: groups,
  };
};

export const updateGroupService = async ({
  organizationId,
  groupId,
  name,
  code,
  description,
  isActive,
}) => {
  const group = await ensureGroupInOrg({ organizationId, groupId });

  if (name !== undefined) group.name = name;
  if (code !== undefined) group.code = code;
  if (description !== undefined) group.description = description;
  if (isActive !== undefined) group.isActive = isActive;

  try {
    await group.save();
    return {
      status: 200,
      payload: {
        message: "Team updated successfully",
        group,
      },
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw createServiceError(400, "Group with same name/code already exists");
    }
    throw error;
  }
};

export const addGroupMemberService = async ({
  organizationId,
  groupId,
  userId,
  roleInGroup,
}) => {
  await ensureGroupInOrg({ organizationId, groupId });
  const user = await ensureUserInOrg({
    organizationId,
    userId,
    notFoundMessage: "User not found in this organization",
  });

  if (user.role === "admin") {
    throw createServiceError(400, "Admin users should not be regular group members");
  }

  const existing = await GroupMembership.findOne({ organizationId, groupId, userId });
  if (existing) {
    throw createServiceError(400, "User is already a member of this group");
  }

  const membership = await GroupMembership.create({
    organizationId,
    groupId,
    userId,
    roleInGroup,
  });

  return {
    status: 201,
    payload: {
        message: "Team membership created successfully",
      membership,
    },
  };
};

export const updateGroupMemberRoleService = async ({
  organizationId,
  groupId,
  userId,
  roleInGroup,
}) => {
  await ensureGroupInOrg({ organizationId, groupId });
  await ensureUserInOrg({ organizationId, userId });

  const membership = await GroupMembership.findOne({
    organizationId,
    groupId,
    userId,
  });
  if (!membership) {
    throw createServiceError(404, "Membership not found");
  }

  membership.roleInGroup = roleInGroup;
  await membership.save();

  return {
    status: 200,
    payload: {
      message: "Membership role updated successfully",
      membership,
    },
  };
};

export const removeGroupMemberService = async ({
  organizationId,
  groupId,
  userId,
}) => {
  await ensureGroupInOrg({ organizationId, groupId });

  const deleted = await GroupMembership.findOneAndDelete({
    organizationId,
    groupId,
    userId,
  });
  if (!deleted) {
    throw createServiceError(404, "Membership not found");
  }

  return {
    status: 200,
    payload: {
        message: "Member removed from team successfully",
    },
  };
};

export const getGroupMembersService = async ({ organizationId, groupId }) => {
  const group = await ensureGroupInOrg({ organizationId, groupId });
  const memberships = await GroupMembership.find({ organizationId, groupId })
    .populate("userId", "name email role isActive")
    .sort({ createdAt: 1 });

  return {
    status: 200,
    payload: {
      group,
      memberships,
    },
  };
};

export const getUserGroupsService = async ({ organizationId, userId }) => {
  await ensureUserInOrg({ organizationId, userId });

  const memberships = await GroupMembership.find({ organizationId, userId })
    .populate("groupId", "name code description isActive")
    .sort({ createdAt: -1 });

  return {
    status: 200,
    payload: memberships,
  };
};

export const selectLeastLoadedMemberService = async ({ organizationId, groupId }) => {
  await ensureGroupInOrg({ organizationId, groupId });
  const membership = await selectLeastLoadedGroupMember({
    organizationId,
    groupId,
    noMembersMessage: "No active members in this group",
  });
  return GroupMembership.findById(membership._id).populate("userId", "name email role isActive");
};

export const assignTaskToGroupService = async ({
  organizationId,
  requesterId,
  requesterRole,
  groupId,
  taskId,
}) => {
  if (requesterRole !== "admin") {
    const requesterMembership = await GroupMembership.findOne({
      organizationId,
      groupId,
      userId: requesterId,
      isActive: true,
    }).select("roleInGroup");

    if (requesterMembership?.roleInGroup !== "team_lead") {
      throw createServiceError(403, "Only admin or team lead can assign tasks for this team");
    }
  }

  const task = await Task.findOne({ _id: taskId, organizationId });
  if (!task) {
    throw createServiceError(404, "Task not found");
  }

  const selectedMembership = await selectLeastLoadedMemberService({
    organizationId,
    groupId,
  });

  task.assignedGroupId = groupId;
  task.assignedTo = selectedMembership.userId._id;
  if (task.status === "pending") {
    task.status = "in_progress";
  }
  await task.save();

  return {
    status: 200,
    payload: {
      message: "Task assigned using workload-based balancing",
      assignment: {
        taskId: task._id,
        groupId,
        userId: selectedMembership.userId._id,
        roleInGroup: selectedMembership.roleInGroup,
      },
    },
  };
};
