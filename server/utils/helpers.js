export const pickDefined = (values) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const toPlainId = (value) => (value ? String(value) : "");

export const minutesBetween = (start, end = new Date()) =>
  Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000));

export const safeJsonParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export default {
  pickDefined,
  clamp,
  toPlainId,
  minutesBetween,
  safeJsonParse,
};
