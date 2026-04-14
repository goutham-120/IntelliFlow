import { createController } from "./controllerHandler.js";
import {
  addGroupMemberService,
  assignTaskToGroupService,
  createGroupService,
  getGroupMembersService,
  getGroupsService,
  getUserGroupsService,
  removeGroupMemberService,
  updateGroupMemberRoleService,
  updateGroupService,
} from "../services/groupService.js";

const withOrg = (req) => ({ organizationId: req.user.organizationId });

export const createGroup = createController("Create Group", createGroupService, (req) => ({
  ...withOrg(req),
  ...req.body,
}));

export const getGroups = createController("Get Groups", getGroupsService, withOrg);

export const updateGroup = createController("Update Group", updateGroupService, (req) => ({
  ...withOrg(req),
  groupId: req.params.groupId,
  ...req.body,
}));

export const addGroupMember = createController("Add Group Member", addGroupMemberService, (req) => ({
  ...withOrg(req),
  groupId: req.params.groupId,
  userId: req.body.userId,
  roleInGroup: req.body.roleInGroup,
}));

export const updateGroupMemberRole = createController(
  "Update Group Member Role",
  updateGroupMemberRoleService,
  (req) => ({
    ...withOrg(req),
    groupId: req.params.groupId,
    userId: req.params.userId,
    roleInGroup: req.body.roleInGroup,
  })
);

export const removeGroupMember = createController(
  "Remove Group Member",
  removeGroupMemberService,
  (req) => ({
    ...withOrg(req),
    groupId: req.params.groupId,
    userId: req.params.userId,
  })
);

export const getGroupMembers = createController("Get Group Members", getGroupMembersService, (req) => ({
  ...withOrg(req),
  groupId: req.params.groupId,
}));

export const getUserGroups = createController("Get User Groups", getUserGroupsService, (req) => ({
  ...withOrg(req),
  userId: req.params.userId,
}));

export const assignTaskToGroup = createController(
  "Assign Task To Group",
  assignTaskToGroupService,
  (req) => ({
    ...withOrg(req),
    requesterId: req.user._id,
    requesterRole: req.user.role,
    groupId: req.params.groupId,
    taskId: req.body.taskId,
  })
);
