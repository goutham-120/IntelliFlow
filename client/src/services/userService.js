import api from "./api";

export const fetchUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUser = async (userId, data) => {
  const response = await api.patch(`/users/${userId}`, data);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// ─── NEW ───────────────────────────────────────────────────────────────────
// Activates or deactivates a user. Expects the backend route:
//   PATCH /users/:userId/status   body: { isActive: boolean }
export const setUserActiveStatus = async (userId, isActive) => {
  const response = await api.patch(`/users/${userId}/status`, { isActive });
  return response.data;
};
