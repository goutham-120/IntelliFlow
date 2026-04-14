import SLARecord from "../models/SLARecord.js";
import Task from "../models/Task.js";
import { createServiceError } from "./serviceHelpers.js";

const DEFAULT_TARGET_MINUTES = 48 * 60;
const WARNING_RATIO = 0.75;

const getElapsedMinutes = (startDate, endDate = new Date()) =>
  Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / 60000));

export const deriveSlaStatus = ({ startedAt, dueAt, completedAt = null, now = new Date() }) => {
  if (completedAt) {
    return "completed";
  }

  const currentTime = new Date(now);
  const warningAt = new Date(
    new Date(startedAt).getTime() +
      (new Date(dueAt).getTime() - new Date(startedAt).getTime()) * WARNING_RATIO
  );

  if (currentTime > new Date(dueAt)) return "breached";
  if (currentTime >= warningAt) return "warning";
  return "on_track";
};

export const createOrUpdateSlaRecordService = async ({
  organizationId,
  taskId,
  workflowId = null,
  stageName = "",
  targetMinutes = DEFAULT_TARGET_MINUTES,
  startedAt = new Date(),
  completedAt = null,
}) => {
  const task = await Task.findOne({ _id: taskId, organizationId }).select("_id");
  if (!task) {
    throw createServiceError(404, "Task not found");
  }

  const dueAt = new Date(new Date(startedAt).getTime() + Number(targetMinutes) * 60000);
  const status = deriveSlaStatus({ startedAt, dueAt, completedAt });

  const record = await SLARecord.findOneAndUpdate(
    { organizationId, taskId, stageName },
    {
      organizationId,
      taskId,
      workflowId,
      stageName,
      targetMinutes,
      elapsedMinutes: getElapsedMinutes(startedAt, completedAt || new Date()),
      startedAt,
      warningAt: new Date(
        new Date(startedAt).getTime() + Number(targetMinutes) * WARNING_RATIO * 60000
      ),
      dueAt,
      completedAt,
      breachedAt: status === "breached" ? new Date() : null,
      status,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    status: 200,
    payload: {
      message: "SLA record saved successfully",
      record,
    },
  };
};

export const getSlaDashboardService = async ({ organizationId, limit = 50 }) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const records = await SLARecord.find({ organizationId })
    .sort({ dueAt: 1 })
    .limit(safeLimit)
    .populate("taskId", "title status stageName assignedTo")
    .populate("workflowId", "name");

  const summary = records.reduce(
    (acc, record) => {
      acc.total += 1;
      acc[record.status] += 1;
      return acc;
    },
    { total: 0, on_track: 0, warning: 0, breached: 0, completed: 0 }
  );

  return {
    status: 200,
    payload: {
      summary,
      records,
    },
  };
};

export default {
  deriveSlaStatus,
  createOrUpdateSlaRecordService,
  getSlaDashboardService,
};
