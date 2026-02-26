export const ROLES = {
  CUSTOMER: "CUSTOMER",
  STAFF: "STAFF",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
  CREATE_GRIEVANCE: "CREATE_GRIEVANCE",
  UPDATE_GRIEVANCE: "UPDATE_GRIEVANCE",
  DELETE_GRIEVANCE: "DELETE_GRIEVANCE",
  ASSIGN_GRIEVANCE: "ASSIGN_GRIEVANCE",
  MANAGE_USERS: "MANAGE_USERS",
  VIEW_REPORTS: "VIEW_REPORTS",
};

export const ROLE_PERMISSIONS = {
  [ROLES.CUSTOMER]: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.CREATE_GRIEVANCE],
  [ROLES.STAFF]: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.UPDATE_GRIEVANCE],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.UPDATE_GRIEVANCE,
    PERMISSIONS.ASSIGN_GRIEVANCE,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin has all permissions
};

export const hasPermission = (roles, permission) => {
  // `roles` may be a single role string or an array
  if (!roles) return false;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.some((r) => {
    const perms = ROLE_PERMISSIONS[r];
    return perms && perms.includes(permission);
  });
};
