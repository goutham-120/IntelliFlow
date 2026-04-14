import mongoose from "mongoose";
import { isNonEmptyString, normalizeBoolean } from "./validatorHelpers.js";

const allowedRolesInGroup = ["member", "team_lead"];

export const validateCreateGroup = (req, res, next) => {
  const { name, code, description } = req.body;

  if (!isNonEmptyString(name) || !isNonEmptyString(code)) {
    return res.status(400).json({ message: "Group name and code are required" });
  }

  req.body.name = name.trim();
  req.body.code = code.trim().toUpperCase();
  req.body.description = isNonEmptyString(description) ? description.trim() : "";
  next();
};

export const validateUpdateGroup = (req, res, next) => {
  const { name, code, description, isActive } = req.body;
  if (
    name === undefined &&
    code === undefined &&
    description === undefined &&
    isActive === undefined
  ) {
    return res.status(400).json({ message: "At least one field is required" });
  }

  if (name !== undefined && !isNonEmptyString(name)) {
    return res.status(400).json({ message: "Invalid group name" });
  }

  if (code !== undefined && !isNonEmptyString(code)) {
    return res.status(400).json({ message: "Invalid group code" });
  }

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ message: "Invalid description" });
  }

  if (isActive !== undefined) {
    const normalized = normalizeBoolean(isActive);
    if (normalized === null) {
      return res.status(400).json({ message: "Invalid isActive value" });
    }
    req.body.isActive = normalized;
  }

  if (name !== undefined) req.body.name = name.trim();
  if (code !== undefined) req.body.code = code.trim().toUpperCase();
  if (description !== undefined) req.body.description = description.trim();
  next();
};

export const validateGroupIdParam = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.groupId)) {
    return res.status(400).json({ message: "Invalid group id" });
  }
  next();
};

export const validateMembershipCreate = (req, res, next) => {
  const { userId, roleInGroup } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  if (roleInGroup !== undefined) {
    const normalized = String(roleInGroup).trim().toLowerCase();
    if (!allowedRolesInGroup.includes(normalized)) {
      return res.status(400).json({ message: "Invalid roleInGroup" });
    }
    req.body.roleInGroup = normalized;
  } else {
    req.body.roleInGroup = "member";
  }

  next();
};

export const validateMembershipRoleUpdate = (req, res, next) => {
  const { roleInGroup } = req.body;
  if (!mongoose.isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  const normalized = String(roleInGroup || "").trim().toLowerCase();
  if (!allowedRolesInGroup.includes(normalized)) {
    return res.status(400).json({ message: "Invalid roleInGroup" });
  }
  req.body.roleInGroup = normalized;
  next();
};

export const validateUserIdParam = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  next();
};

export const validateAssignTaskBody = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.body.taskId)) {
    return res.status(400).json({ message: "Invalid task id" });
  }
  next();
};
