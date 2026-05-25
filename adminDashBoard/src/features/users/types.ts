import type { Role } from "../roles/types";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export type User = {
  id: string;
  email: string;
  fullName: string;
  status: UserStatus;
  roles?: Role[];
  createdAt: string;
};

export type UpdateUserDto = {
  fullName?: string;
  email?: string;
  password?: string;
};

