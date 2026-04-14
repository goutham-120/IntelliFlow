export const TASK_STATUS = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  BLOCKED: "blocked",
});

export const ACTIVE_TASK_STATUSES = Object.freeze([
  TASK_STATUS.PENDING,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.BLOCKED,
]);

export const TASK_STATUS_LIST = Object.freeze(Object.values(TASK_STATUS));

export default TASK_STATUS;
