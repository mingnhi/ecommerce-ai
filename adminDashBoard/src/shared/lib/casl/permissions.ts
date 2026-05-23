export const PERMISSIONS = {
  DASHBOARD: {
    READ: "dashboard:read",
  },
  PRODUCT: {
    READ: "product:read",
    CREATE: "product:create",
    UPDATE: "product:update",
    DELETE: "product:delete",
  },
  ORDER: {
    READ: "order:read",
    UPDATE_STATUS: "order:update_status",
    CANCEL: "order:cancel",
  },
  INVENTORY: {
    READ: "inventory:read",
    IMPORT: "inventory:import",
    CHECK: "inventory:check",
    ADJUST: "inventory:adjust",
    UPDATE_THRESHOLD: "inventory:update_threshold",
    DELETE: "inventory:delete",
  },
  ROLE: {
    READ: "role:read",
    CREATE: "role:create",
    UPDATE: "role:update",
    DELETE: "role:delete",
    ASSIGN_PERMISSIONS: "role:assign_permissions",
  },
  PERMISSION: {
    READ: "permission:read",
    CREATE: "permission:create",
    UPDATE: "permission:update",
    DELETE: "permission:delete",
  },
  USER: {
    READ: "user:read",
    CREATE: "user:create",
    UPDATE: "user:update",
    DELETE: "user:delete",
    UPDATE_STATUS: "user:update_status",
    ASSIGN_ROLES: "user:assign_roles",
  },
} as const;

type PermissionCatalog = typeof PERMISSIONS;

export type PermissionKey =
  PermissionCatalog[keyof PermissionCatalog][keyof PermissionCatalog[keyof PermissionCatalog]];

export function buildPermissionKey(resource: string, action: string): string {
  return `${resource.toLowerCase()}:${action}`;
}

export function includesPermission(
  userPermissions: string[],
  required: PermissionKey | string
): boolean {
  return userPermissions.includes(required);
}
