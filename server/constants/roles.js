export const ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});

export const ROLE_LIST = Object.freeze(Object.values(ROLES));

export const GROUP_ROLES = Object.freeze({
  MEMBER: "member",
  TEAM_LEAD: "team_lead",
});

export const GROUP_ROLE_LIST = Object.freeze(Object.values(GROUP_ROLES));

export default ROLES;
