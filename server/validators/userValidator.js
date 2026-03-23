import {
  ACCEPTED_ROLE_INPUTS,
  normalizeSystemRole,
} from "../utils/systemRole.js";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const validateCreateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password) ||
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
  req.body.password = password.trim();
  req.body.role = normalizedRole;

  next();
};
