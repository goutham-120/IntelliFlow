import api from "./api";

export const fetchGroups = async () => {
  const response = await api.get("/groups");
  return response.data;
};

export const createGroup = async (data) => {
  const response = await api.post("/groups", data);
  return response.data;
};

export const updateGroup = async (groupId, data) => {
  const response = await api.patch(`/groups/${groupId}`, data);
  return response.data;
};

export const fetchGroupMembers = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/members`);
  return response.data;
};

export const addGroupMember = async (groupId, data) => {
  const response = await api.post(`/groups/${groupId}/members`, data);
  return response.data;
};

export const updateGroupMemberRole = async (groupId, userId, roleInGroup) => {
  const response = await api.patch(`/groups/${groupId}/members/${userId}/role`, {
    roleInGroup,
  });
  return response.data;
};

export const removeGroupMember = async (groupId, userId) => {
  const response = await api.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
};

export const assignTaskToGroup = async (groupId, taskId) => {
  const response = await api.post(`/groups/${groupId}/assign-task`, { taskId });
  return response.data;
};
