import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role, RoleFormData, Permission } from "./types";

const mockRoles: Role[] = [
  {
    id: "1",
    name: "ADMIN",
    description: "Quản trị viên hệ thống - toàn quyền",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
    permissionCount: 12,
  },
  {
    id: "2",
    name: "USER",
    description: "Người dùng thường - quyền cơ bản",
    createdAt: "2026-01-16T14:30:00Z",
    updatedAt: "2026-01-16T14:30:00Z",
    permissionCount: 5,
  },
  {
    id: "3",
    name: "MANAGER",
    description: "Quản lý cửa hàng - quản lý sản phẩm và đơn hàng",
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-02-01T09:00:00Z",
    permissionCount: 8,
  },
];

import { mockPermissions } from "../permissions/hooks";

const mockRolePermissionsData: Record<string, string[]> = {
  "1": ["1", "2", "3", "4", "5", "6"],
  "2": ["1", "5"],
  "3": ["1", "2", "3", "5"],
};

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockRoles.map((role) => ({
        ...role,
        permissionCount: mockRolePermissionsData[role.id]?.length || 0,
      }));
    },
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const role = mockRoles.find((r) => r.id === id);
      if (!role) return null;
      return {
        ...role,
        permissionCount: mockRolePermissionsData[role.id]?.length || 0,
      };
    },
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RoleFormData) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newRole: Role = {
        id: String(Date.now()),
        name: data.name,
        description: data.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissionCount: 0,
      };
      mockRoles.push(newRole);
      mockRolePermissionsData[newRole.id] = [];
      return newRole;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RoleFormData }) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const idx = mockRoles.findIndex((r) => r.id === id);
      if (idx !== -1) {
        mockRoles[idx] = {
          ...mockRoles[idx],
          name: data.name,
          description: data.description,
          updatedAt: new Date().toISOString(),
        };
      }
      return { id, ...data };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const idx = mockRoles.findIndex((r) => r.id === id);
      if (idx !== -1) {
        mockRoles.splice(idx, 1);
      }
      delete mockRolePermissionsData[id];
      return { id };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useAvailablePermissions() {
  return useQuery({
    queryKey: ["permissions", "all"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return mockPermissions;
    },
  });
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ["roles", roleId, "permissions"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const ids = mockRolePermissionsData[roleId] || [];
      return mockPermissions.filter((p) => ids.includes(p.id));
    },
    enabled: !!roleId,
  });
}

export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!mockRolePermissionsData[roleId]) {
        mockRolePermissionsData[roleId] = [];
      }
      permissionIds.forEach((id) => {
        if (!mockRolePermissionsData[roleId].includes(id)) {
          mockRolePermissionsData[roleId].push(id);
        }
      });
      return { roleId, permissionIds };
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      void queryClient.invalidateQueries({
        queryKey: ["roles", variables.roleId, "permissions"],
      });
    },
  });
}

export function useRemovePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (mockRolePermissionsData[roleId]) {
        mockRolePermissionsData[roleId] = mockRolePermissionsData[roleId].filter(
          (id) => id !== permissionId
        );
      }
      return { roleId, permissionId };
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      void queryClient.invalidateQueries({
        queryKey: ["roles", variables.roleId, "permissions"],
      });
    },
  });
}

export function useRemovePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (mockRolePermissionsData[roleId]) {
        mockRolePermissionsData[roleId] = mockRolePermissionsData[roleId].filter(
          (id) => !permissionIds.includes(id)
        );
      }
      return { roleId, permissionIds };
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      void queryClient.invalidateQueries({
        queryKey: ["roles", variables.roleId, "permissions"],
      });
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      mockRolePermissionsData[roleId] = [...permissionIds];
      return { roleId, permissionIds };
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      void queryClient.invalidateQueries({
        queryKey: ["roles", variables.roleId, "permissions"],
      });
    },
  });
}
