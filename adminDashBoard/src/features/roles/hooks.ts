import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RoleFormData } from "./types";
import {
  assignRolePermissions,
  createRole,
  deleteRole,
  fetchRole,
  fetchRoles,
  removeRolePermission,
  updateRole,
} from "@/services/roles";

const ROLES_KEY = ["roles"] as const;

const roleDetailKey = (id: string) => [...ROLES_KEY, id] as const;

export function useRoles() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: fetchRoles,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleDetailKey(id),
    queryFn: () => fetchRole(id),
    enabled: !!id,
  });
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: roleDetailKey(roleId),
    queryFn: () => fetchRole(roleId),
    enabled: !!roleId,
    select: (role) => role.permissions,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleFormData }) =>
      updateRole(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}

export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => assignRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}

export function useRemovePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => removeRolePermission(roleId, permissionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => {
      const role = await fetchRole(roleId);
      const currentIds = role.permissions.map((p) => p.id);
      const toAdd = permissionIds.filter((id) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id) => !permissionIds.includes(id));

      await Promise.all(
        toRemove.map((id) => removeRolePermission(roleId, id)),
      );

      if (toAdd.length > 0) {
        await assignRolePermissions(roleId, toAdd);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}

export { usePermissions as useAvailablePermissions } from "../permissions/hooks";
