import Group from "../models/Group.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Workflow from "../models/Workflow.js";
import { createServiceError, ensureWorkflowInOrg } from "./serviceHelpers.js";

// ─── Stage validation helpers (unchanged) ────────────────────────────────────

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
      assignmentType: stage.assignmentType || "auto",
    }));

// ─── NEW: Attach real task stats to a list of workflows ───────────────────────
//
// For each workflow we compute:
//   totalTasks       – total tasks ever created for this workflow
//   activeTasks      – tasks currently in an active (non-terminal) status
//   completedTasks   – tasks with status "done"
//   avgCycleDays     – average days from task.createdAt → task.updatedAt for
//                      completed tasks (updatedAt is the closest proxy we have
//                      for completion time without a dedicated completedAt field
//                      on the task itself)
//
// All counts come from a single aggregate so we only hit the DB once regardless
// of how many workflows are returned.

const ACTIVE_STATUSES = ["pending", "in_progress", "blocked", "needs_changes"];

const attachTaskStats = async (workflows) => {
  if (!workflows.length) return workflows;

  const workflowIds = workflows.map((w) => w._id);

  const stats = await Task.aggregate([
    { $match: { workflowId: { $in: workflowIds } } },
    {
      $group: {
        _id: "$workflowId",
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
        },
        activeTasks: {
          $sum: { $cond: [{ $in: ["$status", ACTIVE_STATUSES] }, 1, 0] },
        },
        // Sum of ms for completed tasks only (used to compute avg cycle time)
        totalCycleMs: {
          $sum: {
            $cond: [
              { $eq: ["$status", "done"] },
              { $subtract: ["$updatedAt", "$createdAt"] },
              0,
            ],
          },
        },
      },
    },
  ]);

  const statsById = new Map(
    stats.map((s) => [
      String(s._id),
      {
        totalTasks: s.totalTasks,
        completedTasks: s.completedTasks,
        activeTasks: s.activeTasks,
        // avgCycleDays: round to 1 decimal, 0 if nothing completed yet
        avgCycleDays:
          s.completedTasks > 0
            ? Number((s.totalCycleMs / s.completedTasks / 86_400_000).toFixed(1))
            : 0,
      },
    ])
  );

  return workflows.map((workflow) => {
    const s = statsById.get(String(workflow._id)) || {
      totalTasks: 0,
      completedTasks: 0,
      activeTasks: 0,
      avgCycleDays: 0,
    };
    // Return a plain object so we can spread extra fields cleanly
    const plain =
      typeof workflow.toObject === "function" ? workflow.toObject() : { ...workflow };
    return { ...plain, ...s };
  });
};

// ─── Service functions ────────────────────────────────────────────────────────

export const createWorkflowService = async ({
  organizationId,
  name,
  stages,
  isActive = true,
  createdBy,         // pass req.user._id from the controller if available
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
    ...(createdBy ? { createdBy } : {}),
  });

  return {
    status: 201,
    payload: {
      message: "Workflow created successfully",
      workflow,
    },
  };
};

export const getWorkflowsService = async ({
  organizationId,
  includeInactive = false,
}) => {
  const query = { organizationId };
  if (!includeInactive) query.isActive = true;

  const workflows = await Workflow.find(query).sort({ createdAt: -1 });

  // Attach real task counts & avg cycle days
  const enriched = await attachTaskStats(workflows);

  return {
    status: 200,
    payload: enriched,
  };
};

export const getWorkflowByIdService = async ({ organizationId, workflowId }) => {
  const workflow = await ensureWorkflowInOrg({ organizationId, workflowId });
  // Enrich the single workflow with task stats too
  const [enriched] = await attachTaskStats([workflow]);
  return {
    status: 200,
    payload: enriched,
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

  if (isActive !== undefined) workflow.isActive = isActive;

  await workflow.save();

  return {
    status: 200,
    payload: {
      message: "Workflow updated successfully",
      workflow,
    },
  };
};