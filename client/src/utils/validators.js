export const isRequired = (value) =>
  !(value === undefined || value === null || String(value).trim() === "");

export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

export const hasMinLength = (value, min) => String(value || "").trim().length >= min;

export const validateRequiredFields = (values, fields) => {
  const missing = fields.filter((field) => !isRequired(values[field]));
  return {
    ok: missing.length === 0,
    missing,
  };
};
