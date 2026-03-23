export const SYSTEM_ROLES = ["admin", "user"];
export const ACCEPTED_ROLE_INPUTS = [...SYSTEM_ROLES];

export const normalizeSystemRole = (role) => {
  const normalized = String(role || "").trim().toLowerCase();

  if (normalized === "admin") return "admin";
  if (normalized === "user") return "user";

  return null;
};
