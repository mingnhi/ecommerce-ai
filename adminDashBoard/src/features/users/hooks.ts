import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateUserDto, UserStatus } from "./types";
import {
  fetchUsers,
  fetchUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  assignUserRoles,
} from "@/services/users";

const USERS_KEY = ["users"] as const;
const userDetailKey = (id: string) => [...USERS_KEY, id] as const;

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: fetchUsers,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userDetailKey(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      updateUser(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      updateUserStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useAssignUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      assignUserRoles(userId, roleIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}
