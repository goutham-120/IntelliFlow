const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value, options = {}) => {
  const date = toDate(value);
  if (!date) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};

export const formatDateTime = (value, options = {}) => {
  const date = toDate(value);
  if (!date) return "-";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};

export const formatRelativeTime = (value) => {
  const date = toDate(value);
  if (!date) return "-";

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
};

export const formatDurationHours = (hours) => {
  const numeric = Number(hours);
  if (!Number.isFinite(numeric)) return "-";
  if (numeric < 24) return `${numeric.toFixed(1)}h`;
  return `${(numeric / 24).toFixed(1)}d`;
};
