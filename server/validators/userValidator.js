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
  if (normalizedRole !== "user") {
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
