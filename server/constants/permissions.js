export const PERMISSIONS = Object.freeze({
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  GROUPS_VIEW: "groups:view",
  GROUPS_MANAGE: "groups:manage",
  WORKFLOWS_VIEW: "workflows:view",
  WORKFLOWS_MANAGE: "workflows:manage",
  TASKS_VIEW: "tasks:view",
  TASKS_MANAGE: "tasks:manage",
  TASKS_ASSIGN: "tasks:assign",
  TASKS_COMPLETE_STAGE: "tasks:complete_stage",
  INBOX_VIEW: "inbox:view",
  ANALYTICS_VIEW: "analytics:view",
  AUDIT_VIEW: "audit:view",
  SLA_VIEW: "sla:view",
  ORG_SETTINGS_VIEW: "org_settings:view",
  ORG_SETTINGS_MANAGE: "org_settings:manage",
});

export const ROLE_PERMISSIONS = Object.freeze({
  admin: Object.freeze(Object.values(PERMISSIONS)),
  user: Object.freeze([
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.WORKFLOWS_VIEW,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_MANAGE,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.TASKS_COMPLETE_STAGE,
    PERMISSIONS.INBOX_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SLA_VIEW,
  ]),
});

export default PERMISSIONS;
