import api from "./api";

export const fetchTasks = async (params = {}) => {
  const response = await api.get("/tasks", { params });
  return response.data;
};

export const fetchTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (data) => {
  const response = await api.post("/tasks", data);
  return response.data;
};

export const updateTask = async (taskId, data) => {
  const response = await api.patch(`/tasks/${taskId}`, data);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

export const completeTaskStage = async (taskId) => {
  const response = await api.post(`/tasks/${taskId}/complete-stage`);
  return response.data;
};
