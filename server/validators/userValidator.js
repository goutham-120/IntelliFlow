import {
  ACCEPTED_ROLE_INPUTS,
  normalizeSystemRole,
} from "../utils/systemRole.js";
import { isNonEmptyString } from "./validatorHelpers.js";

export const validateCreateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(role)
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const normalizedInputRole = role.trim().toLowerCase();
  if (!ACCEPTED_ROLE_INPUTS.includes(normalizedInputRole)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const normalizedRole = normalizeSystemRole(normalizedInputRole);
  if (!normalizedRole) {
    return res.status(400).json({ message: "Invalid role" });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  if (isNonEmptyString(password)) {
    req.body.password = password.trim();
  } else {
    delete req.body.password;
  }
  req.body.role = normalizedRole;

  next();
};

export const validateUpdateUser = (req, res, next) => {
  const { name, email, password, role, isActive } = req.body;
  const updates = {};

  if (name !== undefined) {
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    updates.name = name.trim();
  }

  if (email !== undefined) {
    if (!isNonEmptyString(email)) {
      return res.status(400).json({ message: "Email cannot be empty" });
    }
    updates.email = email.trim().toLowerCase();
  }

  if (password !== undefined) {
    if (isNonEmptyString(password)) {
      updates.password = password.trim();
    }
  }

  if (role !== undefined) {
    if (!isNonEmptyString(role)) {
      return res.status(400).json({ message: "Role cannot be empty" });
    }

    const normalizedInputRole = role.trim().toLowerCase();
    if (!ACCEPTED_ROLE_INPUTS.includes(normalizedInputRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const normalizedRole = normalizeSystemRole(normalizedInputRole);
    if (!normalizedRole) {
      return res.status(400).json({ message: "Invalid role" });
    }
    updates.role = normalizedRole;
  }

  if (isActive !== undefined) {
    updates.isActive = Boolean(isActive);
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  req.body = updates;
  next();
};
