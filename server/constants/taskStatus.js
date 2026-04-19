export const TASK_STATUS = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  BLOCKED: "blocked",
  REJECTED: "rejected",
  NEEDS_CHANGES: "needs_changes",
});

export const ACTIVE_TASK_STATUSES = Object.freeze([
  TASK_STATUS.PENDING,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.BLOCKED,
  TASK_STATUS.REJECTED,
  TASK_STATUS.NEEDS_CHANGES,
]);

export const TASK_STATUS_LIST = Object.freeze(Object.values(TASK_STATUS));

export default TASK_STATUS;
