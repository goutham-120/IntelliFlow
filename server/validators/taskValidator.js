import mongoose from "mongoose";
import { isNonEmptyString, normalizeNullableObjectId } from "./validatorHelpers.js";

const allowedStatuses = [
  "pending",
  "in_progress",
  "done",
  "blocked",
  "rejected",
  "needs_changes",
];

const validateStatus = (status) => {
  if (status === undefined) return { ok: true };
  const normalized = String(status).trim().toLowerCase();
  if (!allowedStatuses.includes(normalized)) {
    return { ok: false, message: "Invalid status" };
  }
  return { ok: true, value: normalized };
};

export const validateTaskIdParam = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.taskId)) {
    return res.status(400).json({ message: "Invalid task id" });
  }
  next();
};

export const validateTaskQuery = (req, res, next) => {
  const { status, workflowId, assignedTo } = req.query;
  const parsedStatus = validateStatus(status);
  if (!parsedStatus.ok) {
    return res.status(400).json({ message: parsedStatus.message });
  }
  if (parsedStatus.value) req.query.status = parsedStatus.value;

  if (workflowId !== undefined && !mongoose.isValidObjectId(workflowId)) {
    return res.status(400).json({ message: "Invalid workflow id" });
  }
  if (assignedTo !== undefined && !mongoose.isValidObjectId(assignedTo)) {
    return res.status(400).json({ message: "Invalid assignedTo user id" });
  }
  next();
};

export const validateCreateTask = (req, res, next) => {
  const { title, status, workflowId, stageName, assignedGroupId, assignedTo } = req.body;

  if (!isNonEmptyString(title)) {
    return res.status(400).json({ message: "Task title is required" });
  }

  const parsedStatus = validateStatus(status);
  if (!parsedStatus.ok) {
    return res.status(400).json({ message: parsedStatus.message });
  }

  const normalizedWorkflowId = normalizeNullableObjectId(workflowId);
  const normalizedAssignedGroupId = normalizeNullableObjectId(assignedGroupId);
  const normalizedAssignedTo = normalizeNullableObjectId(assignedTo);

  if (normalizedWorkflowId !== null && !mongoose.isValidObjectId(normalizedWorkflowId)) {
    return res.status(400).json({ message: "Invalid workflow id" });
  }
  if (
    normalizedAssignedGroupId !== null &&
    !mongoose.isValidObjectId(normalizedAssignedGroupId)
  ) {
    return res.status(400).json({ message: "Invalid assignedGroupId" });
  }
  if (normalizedAssignedTo !== null && !mongoose.isValidObjectId(normalizedAssignedTo)) {
    return res.status(400).json({ message: "Invalid assignedTo user id" });
  }
  if (stageName !== undefined && stageName !== null && !isNonEmptyString(stageName)) {
    return res.status(400).json({ message: "Invalid stageName" });
  }
  if (normalizedWorkflowId === null && stageName !== undefined && stageName !== null) {
    return res
      .status(400)
      .json({ message: "stageName can be set only when workflowId is provided" });
  }

  req.body.title = title.trim();
  req.body.workflowId = normalizedWorkflowId;
  req.body.assignedGroupId = normalizedAssignedGroupId;
  req.body.assignedTo = normalizedAssignedTo;
  if (stageName !== undefined && stageName !== null) req.body.stageName = stageName.trim();
  if (parsedStatus.value) req.body.status = parsedStatus.value;
  next();
};

export const validateUpdateTask = (req, res, next) => {
  const { title, status, workflowId, stageName, assignedGroupId, assignedTo } = req.body;

  if (
    title === undefined &&
    status === undefined &&
    workflowId === undefined &&
    stageName === undefined &&
    assignedGroupId === undefined &&
    assignedTo === undefined
  ) {
    return res.status(400).json({ message: "At least one field is required" });
  }

  if (title !== undefined) {
    if (!isNonEmptyString(title)) {
      return res.status(400).json({ message: "Invalid task title" });
    }
    req.body.title = title.trim();
  }

  const parsedStatus = validateStatus(status);
  if (!parsedStatus.ok) {
    return res.status(400).json({ message: parsedStatus.message });
  }
  if (parsedStatus.value) req.body.status = parsedStatus.value;

  if (workflowId !== undefined) {
    const normalizedWorkflowId = normalizeNullableObjectId(workflowId);
    if (normalizedWorkflowId !== null && !mongoose.isValidObjectId(normalizedWorkflowId)) {
      return res.status(400).json({ message: "Invalid workflow id" });
    }
    req.body.workflowId = normalizedWorkflowId;
  }

  if (assignedGroupId !== undefined) {
    const normalizedAssignedGroupId = normalizeNullableObjectId(assignedGroupId);
    if (
      normalizedAssignedGroupId !== null &&
      !mongoose.isValidObjectId(normalizedAssignedGroupId)
    ) {
      return res.status(400).json({ message: "Invalid assignedGroupId" });
    }
    req.body.assignedGroupId = normalizedAssignedGroupId;
  }

  if (assignedTo !== undefined) {
    const normalizedAssignedTo = normalizeNullableObjectId(assignedTo);
    if (normalizedAssignedTo !== null && !mongoose.isValidObjectId(normalizedAssignedTo)) {
      return res.status(400).json({ message: "Invalid assignedTo user id" });
    }
    req.body.assignedTo = normalizedAssignedTo;
  }

  if (stageName !== undefined) {
    if (stageName !== null && !isNonEmptyString(stageName)) {
      return res.status(400).json({ message: "Invalid stageName" });
    }
    req.body.stageName = stageName === null ? null : stageName.trim();
  }

  next();
};
