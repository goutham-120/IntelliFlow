import api from "./api";

export const fetchWorkflows = async (includeInactive = false) => {
  const response = await api.get("/workflows", {
    params: { includeInactive },
  });
  return response.data;
};

export const createWorkflow = async (data) => {
  const response = await api.post("/workflows", data);
  return response.data;
};

export const fetchWorkflowById = async (workflowId) => {
  const response = await api.get(`/workflows/${workflowId}`);
  return response.data;
};

export const updateWorkflow = async (workflowId, data) => {
  const response = await api.patch(`/workflows/${workflowId}`, data);
  return response.data;
};
