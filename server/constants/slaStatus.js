export const SLA_STATUS = Object.freeze({
  ON_TRACK: "on_track",
  WARNING: "warning",
  BREACHED: "breached",
  COMPLETED: "completed",
});

export const SLA_STATUS_LIST = Object.freeze(Object.values(SLA_STATUS));

export default SLA_STATUS;
