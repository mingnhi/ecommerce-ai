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

import type { ApiEnvelope } from '@/types/common';

export type { ApiEnvelope };

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
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  introduction?: string;
  avatar?: string;
  userName?: string;
  image?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  introduction?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  logoutAllSessions?: boolean;
}
