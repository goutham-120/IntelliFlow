import Group from "../models/Group.js";
import Workflow from "../models/Workflow.js";

const createServiceError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const ensureStageOrderIsSequential = (stages) => {
  const sortedOrders = [...stages].map((s) => s.order).sort((a, b) => a - b);
  const expected = Array.from({ length: stages.length }, (_, i) => i + 1);
  const isSequential = sortedOrders.every((value, index) => value === expected[index]);
  if (!isSequential) {
    throw createServiceError(400, "Stage order must be sequential starting from 1");
  }
};

const ensureStageGroupsInOrg = async ({ organizationId, stages }) => {
  const uniqueGroupIds = [...new Set(stages.map((stage) => String(stage.groupId)))];
  const groups = await Group.find({
    organizationId,
    _id: { $in: uniqueGroupIds },
  }).select("_id");

  if (groups.length !== uniqueGroupIds.length) {
    throw createServiceError(400, "One or more stages reference invalid groups");
  }
};

const normalizeStagesForStorage = (stages) =>
  [...stages]
    .sort((a, b) => a.order - b.order)
    .map((stage) => ({
      name: stage.name,
      order: stage.order,
      groupId: stage.groupId,
    }));

const ensureWorkflowInOrg = async ({ organizationId, workflowId }) => {
  const workflow = await Workflow.findOne({ _id: workflowId, organizationId });
  if (!workflow) {
    throw createServiceError(404, "Workflow not found");
  }
  return workflow;
};

export const createWorkflowService = async ({
  organizationId,
  name,
  stages,
  isActive = true,
}) => {
  const existing = await Workflow.findOne({ organizationId, name });
  if (existing) {
    throw createServiceError(400, "Workflow with this name already exists");
  }

  ensureStageOrderIsSequential(stages);
  await ensureStageGroupsInOrg({ organizationId, stages });

  const workflow = await Workflow.create({
    organizationId,
    name,
    stages: normalizeStagesForStorage(stages),
    isActive,
  });

  return {
    status: 201,
    payload: {
      message: "Workflow created successfully",
      workflow,
    },
  };
};

export const getWorkflowsService = async ({ organizationId, includeInactive = false }) => {
  const query = { organizationId };
  if (!includeInactive) {
    query.isActive = true;
  }

  const workflows = await Workflow.find(query).sort({ createdAt: -1 });
  return {
    status: 200,
    payload: workflows,
  };
};

export const getWorkflowByIdService = async ({ organizationId, workflowId }) => {
  const workflow = await ensureWorkflowInOrg({ organizationId, workflowId });
  return {
    status: 200,
    payload: workflow,
  };
};

export const updateWorkflowService = async ({
  organizationId,
  workflowId,
  name,
  stages,
  isActive,
}) => {
  const workflow = await ensureWorkflowInOrg({ organizationId, workflowId });

  if (name !== undefined && name !== workflow.name) {
    const existing = await Workflow.findOne({
      organizationId,
      name,
      _id: { $ne: workflowId },
    });
    if (existing) {
      throw createServiceError(400, "Workflow with this name already exists");
    }
    workflow.name = name;
  }

  if (stages !== undefined) {
    ensureStageOrderIsSequential(stages);
    await ensureStageGroupsInOrg({ organizationId, stages });
    workflow.stages = normalizeStagesForStorage(stages);
  }

  if (isActive !== undefined) {
    workflow.isActive = isActive;
  }

  await workflow.save();

  return {
    status: 200,
    payload: {
      message: "Workflow updated successfully",
      workflow,
    },
  };
};
