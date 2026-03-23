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

export const createGroup = async (req, res) => {
  try {
    const result = await createGroupService({
      organizationId: req.user.organizationId,
      ...req.body,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Create Group Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const result = await getGroupsService({
      organizationId: req.user.organizationId,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Get Groups Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const result = await updateGroupService({
      organizationId: req.user.organizationId,
      groupId: req.params.groupId,
      ...req.body,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Update Group Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const addGroupMember = async (req, res) => {
  try {
    const result = await addGroupMemberService({
      organizationId: req.user.organizationId,
      groupId: req.params.groupId,
      userId: req.body.userId,
      roleInGroup: req.body.roleInGroup,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Add Group Member Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const updateGroupMemberRole = async (req, res) => {
  try {
    const result = await updateGroupMemberRoleService({
      organizationId: req.user.organizationId,
      groupId: req.params.groupId,
      userId: req.params.userId,
      roleInGroup: req.body.roleInGroup,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Update Group Member Role Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const removeGroupMember = async (req, res) => {
  try {
    const result = await removeGroupMemberService({
      organizationId: req.user.organizationId,
      groupId: req.params.groupId,
      userId: req.params.userId,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Remove Group Member Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const getGroupMembers = async (req, res) => {
  try {
    const result = await getGroupMembersService({
      organizationId: req.user.organizationId,
      groupId: req.params.groupId,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Get Group Members Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const result = await getUserGroupsService({
      organizationId: req.user.organizationId,
      userId: req.params.userId,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Get User Groups Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const assignTaskToGroup = async (req, res) => {
  try {
    const result = await assignTaskToGroupService({
      organizationId: req.user.organizationId,
      requesterId: req.user._id,
      requesterRole: req.user.role,
      groupId: req.params.groupId,
      taskId: req.body.taskId,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Assign Task To Group Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};
