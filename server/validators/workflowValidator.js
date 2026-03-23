import mongoose from "mongoose";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
};

const validateAndNormalizeStages = (stages) => {
  if (!Array.isArray(stages) || stages.length === 0) {
    return { error: "At least one stage is required" };
  }

  const normalizedStages = [];
  const seenNames = new Set();
  const seenOrders = new Set();

  for (const stage of stages) {
    const rawName = stage?.name;
    const rawOrder = stage?.order;
    const rawGroupId = stage?.groupId;

    if (!isNonEmptyString(rawName)) {
      return { error: "Each stage must have a valid name" };
    }

    if (!Number.isInteger(rawOrder) || rawOrder < 1) {
      return { error: "Each stage must have a valid positive integer order" };
    }

    if (!mongoose.isValidObjectId(rawGroupId)) {
      return { error: "Each stage must have a valid groupId" };
    }

    const name = rawName.trim();
    const normalizedNameKey = name.toLowerCase();
    if (seenNames.has(normalizedNameKey)) {
      return { error: "Stage names must be unique" };
    }
    if (seenOrders.has(rawOrder)) {
      return { error: "Stage order values must be unique" };
    }

    seenNames.add(normalizedNameKey);
    seenOrders.add(rawOrder);
    normalizedStages.push({
      name,
      order: rawOrder,
      groupId: rawGroupId,
    });
  }

  return { stages: normalizedStages };
};

export const validateWorkflowIdParam = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.workflowId)) {
    return res.status(400).json({ message: "Invalid workflow id" });
  }
  next();
};

export const validateCreateWorkflow = (req, res, next) => {
  const { name, stages, isActive } = req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ message: "Workflow name is required" });
  }

  const stageValidation = validateAndNormalizeStages(stages);
  if (stageValidation.error) {
    return res.status(400).json({ message: stageValidation.error });
  }

  req.body.name = name.trim();
  req.body.stages = stageValidation.stages;

  if (isActive !== undefined) {
    const normalized = normalizeBoolean(isActive);
    if (normalized === null) {
      return res.status(400).json({ message: "Invalid isActive value" });
    }
    req.body.isActive = normalized;
  }

  next();
};

export const validateUpdateWorkflow = (req, res, next) => {
  const { name, stages, isActive } = req.body;

  if (name === undefined && stages === undefined && isActive === undefined) {
    return res.status(400).json({ message: "At least one field is required" });
  }

  if (name !== undefined) {
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: "Invalid workflow name" });
    }
    req.body.name = name.trim();
  }

  if (stages !== undefined) {
    const stageValidation = validateAndNormalizeStages(stages);
    if (stageValidation.error) {
      return res.status(400).json({ message: stageValidation.error });
    }
    req.body.stages = stageValidation.stages;
  }

  if (isActive !== undefined) {
    const normalized = normalizeBoolean(isActive);
    if (normalized === null) {
      return res.status(400).json({ message: "Invalid isActive value" });
    }
    req.body.isActive = normalized;
  }

  next();
};
