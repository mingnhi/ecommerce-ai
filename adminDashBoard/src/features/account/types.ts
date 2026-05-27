export type Gender = "MALE" | "FEMALE" | "OTHER";

export type UserProfile = {
  fullName?: string;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  avatarUrl?: string | null;
};

export type UpdateProfileDto = {
  fullName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: Gender;
};

export type UpdatePasswordDto = {
  currentPassword: string;
  newPassword: string;
  logoutAllSessions?: boolean;
};
