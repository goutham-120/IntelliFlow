export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
};

export const normalizeNullableObjectId = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
};
