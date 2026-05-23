import { httpClient } from "./http";
import { unwrapApiData } from "./api";
import type { Permission, PermissionFormData } from "@/features/roles/types";

export async function fetchPermissions(): Promise<Permission[]> {
  const res = await httpClient.get("/permissions");
  return unwrapApiData<Permission[]>(res.data);
}

export async function fetchPermission(id: string): Promise<Permission> {
  const res = await httpClient.get(`/permissions/${id}`);
  return unwrapApiData<Permission>(res.data);
}

export async function createPermission(data: PermissionFormData): Promise<Permission> {
  const res = await httpClient.post("/permissions", data);
  return unwrapApiData<Permission>(res.data);
}

export async function updatePermission(id: string, data: PermissionFormData): Promise<Permission> {
  const res = await httpClient.patch(`/permissions/${id}`, data);
  return unwrapApiData<Permission>(res.data);
}

export async function deletePermission(id: string): Promise<void> {
  await httpClient.delete(`/permissions/${id}`);
}
