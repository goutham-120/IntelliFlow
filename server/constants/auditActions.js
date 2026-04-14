export const AUDIT_ACTIONS = Object.freeze({
  ORG_REGISTERED: "org_registered",
  ORG_UPDATED: "org_updated",
  USER_CREATED: "user_created",
  USER_LOGIN: "user_login",
  GROUP_CREATED: "group_created",
  GROUP_UPDATED: "group_updated",
  GROUP_MEMBER_ADDED: "group_member_added",
  GROUP_MEMBER_REMOVED: "group_member_removed",
  WORKFLOW_CREATED: "workflow_created",
  WORKFLOW_UPDATED: "workflow_updated",
  TASK_CREATED: "task_created",
  TASK_UPDATED: "task_updated",
  TASK_STAGE_COMPLETED: "task_stage_completed",
  TASK_DELETED: "task_deleted",
  NOTIFICATION_READ: "notification_read",
});

export const AUDIT_ACTION_LIST = Object.freeze(Object.values(AUDIT_ACTIONS));

export default AUDIT_ACTIONS;
