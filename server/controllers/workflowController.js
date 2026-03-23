import {
  createWorkflowService,
  getWorkflowByIdService,
  getWorkflowsService,
  updateWorkflowService,
} from "../services/workflowService.js";

export const createWorkflow = async (req, res) => {
  try {
    const result = await createWorkflowService({
      organizationId: req.user.organizationId,
      ...req.body,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Create Workflow Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const getWorkflows = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const result = await getWorkflowsService({
      organizationId: req.user.organizationId,
      includeInactive,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Get Workflows Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const getWorkflowById = async (req, res) => {
  try {
    const result = await getWorkflowByIdService({
      organizationId: req.user.organizationId,
      workflowId: req.params.workflowId,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Get Workflow Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const updateWorkflow = async (req, res) => {
  try {
    const result = await updateWorkflowService({
      organizationId: req.user.organizationId,
      workflowId: req.params.workflowId,
      ...req.body,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Update Workflow Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};
