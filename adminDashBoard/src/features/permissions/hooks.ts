import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PermissionFormData } from "../roles/types";
import {
  createPermission,
  deletePermission,
  fetchPermission,
  fetchPermissions,
  updatePermission,
} from "@/services/permissions";

const PERMISSIONS_KEY = ["permissions"] as const;
const ROLES_KEY = ["roles"] as const;

export function usePermissions() {
  return useQuery({
    queryKey: PERMISSIONS_KEY,
    queryFn: fetchPermissions,
  });
}

export function usePermission(id: string) {
  return useQuery({
    queryKey: [...PERMISSIONS_KEY, id],
    queryFn: () => fetchPermission(id),
    enabled: !!id,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPermission,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PermissionFormData }) =>
      updatePermission(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermission,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: ROLES_KEY });
    },
  });
}
