import type { ApiEnvelope } from '@/types/common';

export type { ApiEnvelope };

export type UserRole = 'admin' | 'user' | 'company';

export type OtpType = 'REGISTER' | 'FORGOT_PASSWORD';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: number;
  type: OtpType;
}

export interface ResendOtpRequest {
  email: string;
  type: OtpType;
}

export interface RegisterResponseData {
  user: {
    id: string;
    email: string;
    fullName: string;
    status: string;
  };
}

export interface VerifyRegisterOtpData {
  id: string;
  email: string;
  fullName: string;
  status: string;
  verified: boolean;
}

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  roles: string[];
};

export interface AuthenticatedResponse {
  token?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    roles?: string[];
  };
}

export interface AuthError {
  messages: string[];
}

export interface AuthResponse extends ApiEnvelope<AuthenticatedResponse> {
  succeeded?: boolean;
  data?: AuthenticatedResponse;
  messages?: string[];
}

export interface UserResponse {
  id?: string;
  email?: string;
  role?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  introduction?: string;
  avatar?: string;
  userName?: string;
  image?: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserProfileResponse {
  fullName?: string;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  avatarUrl?: string | null;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: Gender;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  logoutAllSessions?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: number;
  newPassword: string;
}
