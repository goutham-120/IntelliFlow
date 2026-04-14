import api from "./api";
import { emitInboxUpdated } from "./notificationService";

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
  emitInboxUpdated();
  return response.data;
};

export const updateTask = async (taskId, data) => {
  const response = await api.patch(`/tasks/${taskId}`, data);
  emitInboxUpdated();
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

export const completeTaskStage = async (taskId) => {
  const response = await api.post(`/tasks/${taskId}/complete-stage`);
  emitInboxUpdated();
  return response.data;
};
