import {
  ACCEPTED_ROLE_INPUTS,
  normalizeSystemRole,
} from "../utils/systemRole.js";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const validateRegisterOrg = (req, res, next) => {
  const { orgName, orgCode, adminName, adminEmail, adminPassword } = req.body;

  if (
    !isNonEmptyString(orgName) ||
    !isNonEmptyString(orgCode) ||
    !isNonEmptyString(adminName) ||
    !isNonEmptyString(adminEmail) ||
    !isNonEmptyString(adminPassword)
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  req.body.orgName = orgName.trim();
  req.body.orgCode = orgCode.trim().toUpperCase();
  req.body.adminName = adminName.trim();
  req.body.adminEmail = adminEmail.trim().toLowerCase();

  next();
};

export const validateVerifyOrg = (req, res, next) => {
  const { orgCode } = req.body;

  if (!isNonEmptyString(orgCode)) {
    return res.status(400).json({ message: "Organization code is required" });
  }

  req.body.orgCode = orgCode.trim().toUpperCase();

  next();
};

export const validateLoginUser = (req, res, next) => {
  const { orgCode, email, password, role } = req.body;

  if (
    !isNonEmptyString(orgCode) ||
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

  req.body.orgCode = orgCode.trim().toUpperCase();
  req.body.email = email.trim().toLowerCase();
  req.body.role = normalizedRole;

  next();
};
