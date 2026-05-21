import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Permission, PermissionFormData } from "../roles/types";

export let mockPermissions: Permission[] = [
  {
    id: "1",
    name: "Xem sản phẩm",
    resource: "Product",
    action: "read",
    description: "Quyền xem danh sách và chi tiết sản phẩm",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Tạo sản phẩm",
    resource: "Product",
    action: "create",
    description: "Quyền tạo sản phẩm mới",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "3",
    name: "Cập nhật sản phẩm",
    resource: "Product",
    action: "update",
    description: "Quyền chỉnh sửa thông tin sản phẩm",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "4",
    name: "Xóa sản phẩm",
    resource: "Product",
    action: "delete",
    description: "Quyền xóa sản phẩm",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "5",
    name: "Xem đơn hàng",
    resource: "Order",
    action: "read",
    description: "Quyền xem danh sách và chi tiết đơn hàng",
    createdAt: "2026-01-16T11:00:00Z",
    updatedAt: "2026-01-16T11:00:00Z",
  },
  {
    id: "6",
    name: "Cập nhật đơn hàng",
    resource: "Order",
    action: "update",
    description: "Quyền cập nhật trạng thái đơn hàng",
    createdAt: "2026-01-16T11:00:00Z",
    updatedAt: "2026-01-16T11:00:00Z",
  },
];

const RESOURCE_NAMES_VI: Record<string, string> = {
  Product: "sản phẩm",
  Order: "đơn hàng",
  User: "người dùng",
  Role: "vai trò",
  Permission: "quyền hạn",
  all: "tất cả",
};

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [...mockPermissions];
    },
  });
}

export function usePermission(id: string) {
  return useQuery({
    queryKey: ["permissions", id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockPermissions.find((p) => p.id === id) || null;
    },
    enabled: !!id,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PermissionFormData) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const nowStr = new Date().toISOString();

      if (data.action === "manage") {
        const actions = ["read", "create", "update", "delete"];
        const actionLabels: Record<string, string> = {
          read: "Xem",
          create: "Tạo",
          update: "Cập nhật",
          delete: "Xóa",
        };
        const resLabel = RESOURCE_NAMES_VI[data.resource] || data.resource.toLowerCase();

        const newPermissions: Permission[] = actions.map((act, i) => {
          let desc = "";
          if (act === "read") desc = `Quyền xem danh sách và chi tiết ${resLabel}`;
          else if (act === "create") desc = `Quyền tạo ${resLabel} mới`;
          else if (act === "update") desc = `Quyền chỉnh sửa thông tin ${resLabel}`;
          else if (act === "delete") desc = `Quyền xóa ${resLabel}`;

          return {
            id: String(Date.now() + i),
            name: `${actionLabels[act]} ${resLabel}`,
            resource: data.resource,
            action: act,
            description: desc,
            createdAt: nowStr,
            updatedAt: nowStr,
          };
        });

        mockPermissions.push(...newPermissions);
        return newPermissions[0];
      } else {
        const newPermission: Permission = {
          id: String(Date.now()),
          name: data.name,
          resource: data.resource,
          action: data.action,
          description: data.description,
          createdAt: nowStr,
          updatedAt: nowStr,
        };
        mockPermissions.push(newPermission);
        return newPermission;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: PermissionFormData;
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const index = mockPermissions.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockPermissions[index] = {
          ...mockPermissions[index],
          name: data.name,
          resource: data.resource,
          action: data.action,
          description: data.description,
          updatedAt: new Date().toISOString(),
        };
        return mockPermissions[index];
      }
      throw new Error("Không tìm thấy quyền hạn");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      mockPermissions = mockPermissions.filter((p) => p.id !== id);
      return { id };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}
