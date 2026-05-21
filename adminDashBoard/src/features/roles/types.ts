export type Role = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  permissionCount?: number;
};

export type RoleFormData = {
  name: string;
  description: string;
};

export type RoleWithPermissions = Role & {
  permissions: Permission[];
};

export type Permission = {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type PermissionFormData = {
  name: string;
  resource: string;
  action: string;
  description: string;
};
