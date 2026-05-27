import { httpClient } from "./http";
import { unwrapApiData } from "./api";
import type {
  Permission,
  Role,
  RoleDetail,
  RoleFormData,
} from "@/features/roles/types";

type RoleApiRecord = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  rolePermissions?: Array<{ permission: Permission }>;
};

function toRole(raw: RoleApiRecord): Role {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? "",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? raw.createdAt,
    permissionCount: raw.rolePermissions?.length ?? 0,
  };
}

function toRoleDetail(raw: RoleApiRecord): RoleDetail {
  return {
    ...toRole(raw),
    permissions: raw.rolePermissions?.map((link) => link.permission) ?? [],
  };
}

export async function fetchRoles(): Promise<Role[]> {
  const res = await httpClient.get("/roles");
  return unwrapApiData<RoleApiRecord[]>(res.data).map(toRole);
}

export async function fetchRole(id: string): Promise<RoleDetail> {
  const res = await httpClient.get(`/roles/${id}`);
  return toRoleDetail(unwrapApiData<RoleApiRecord>(res.data));
}

export async function createRole(data: RoleFormData): Promise<Role> {
  const res = await httpClient.post("/roles", data);
  return toRole(unwrapApiData<RoleApiRecord>(res.data));
}

export async function updateRole(id: string, data: RoleFormData): Promise<Role> {
  const res = await httpClient.put(`/roles/${id}`, data);
  return toRole(unwrapApiData<RoleApiRecord>(res.data));
}

export async function deleteRole(id: string): Promise<void> {
  await httpClient.delete(`/roles/${id}`);
}

export async function assignRolePermissions(
  roleId: string,
  permissionIds: string[],
): Promise<void> {
  await httpClient.post(`/roles/${roleId}/permissions`, { permissionIds });
}

export async function removeRolePermission(
  roleId: string,
  permissionId: string,
): Promise<void> {
  await httpClient.delete(`/roles/${roleId}/permissions/${permissionId}`);
}
