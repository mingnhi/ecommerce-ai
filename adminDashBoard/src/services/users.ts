import { httpClient } from "./http";
import { unwrapApiData } from "./api";
import type { User, UpdateUserDto, UserStatus } from "@/features/users/types";

export const fetchUsers = async (): Promise<User[]> => {
  const res = await httpClient.get("/users");
  return unwrapApiData<User[]>(res.data);
};

export const fetchUser = async (id: string): Promise<User> => {
  const res = await httpClient.get(`/users/${id}`);
  return unwrapApiData<User>(res.data);
};

export const updateUser = async (
  id: string,
  dto: UpdateUserDto
): Promise<User> => {
  const res = await httpClient.put(`/users/${id}`, dto);
  return unwrapApiData<User>(res.data);
};

export const updateUserStatus = async (
  id: string,
  status: UserStatus
): Promise<void> => {
  await httpClient.patch(`/users/${id}/status`, { status });
};

export const deleteUser = async (id: string): Promise<void> => {
  await httpClient.delete(`/users/${id}`);
};

export const assignUserRoles = async (userId: string, roleIds: string[]): Promise<void> => {
  await httpClient.post(`/users/${userId}/roles`, { roleIds });
};
