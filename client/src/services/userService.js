import api from "./api";

// Get all users (Admin only)
export const fetchUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

// Create new user (Admin only)
export const createUser = async (data) => {
  const response = await api.post("/users", data);
  return response.data;
};