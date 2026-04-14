import { createController } from "./controllerHandler.js";
import {
  createWorkflowService,
  getWorkflowByIdService,
  getWorkflowsService,
  updateWorkflowService,
} from "../services/workflowService.js";

export const createWorkflow = createController("Create Workflow", createWorkflowService, (req) => ({
  organizationId: req.user.organizationId,
  ...req.body,
}));

export const getWorkflows = createController("Get Workflows", getWorkflowsService, (req) => ({
  organizationId: req.user.organizationId,
  includeInactive: req.query.includeInactive === "true",
}));

export const getWorkflowById = createController("Get Workflow", getWorkflowByIdService, (req) => ({
  organizationId: req.user.organizationId,
  workflowId: req.params.workflowId,
}));

export const updateWorkflow = createController("Update Workflow", updateWorkflowService, (req) => ({
  organizationId: req.user.organizationId,
  workflowId: req.params.workflowId,
  ...req.body,
}));
