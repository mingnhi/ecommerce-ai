import { request } from '../axios';
import { KEYS } from './keys';
import type {
  ApiEnvelope,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponseData,
  ResendOtpRequest,
  UpdateProfileRequest,
  UserResponse,
  VerifyOtpRequest,
  VerifyRegisterOtpData,
} from './types';

export const AuthService = {
  login: async (data: LoginRequest) => {
    return request.post<ApiEnvelope>(KEYS.AUTH_LOGIN, {
      email: data.email,
      password: data.password,
    });
  },

  register: async (data: RegisterRequest) => {
    return request.post<ApiEnvelope<RegisterResponseData>>(KEYS.AUTH_REGISTER, {
      email: data.email,
      password: data.password,
      fullName: `${data.firstName} ${data.lastName}`.trim(),
    });
  },

  verifyRegisterOtp: async (data: VerifyOtpRequest) => {
    return request.post<ApiEnvelope<VerifyRegisterOtpData>>(KEYS.OTP_VERIFY_REGISTER, data);
  },

  resendRegisterOtp: async (email: string) => {
    const body: ResendOtpRequest = { email, type: 'REGISTER' };
    return request.post<ApiEnvelope>(KEYS.OTP_RESEND, body);
  },

  me: async () => {
    return request.get<ApiEnvelope<UserResponse>>(KEYS.AUTH_ME);
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    return request.put<ApiEnvelope>(KEYS.AUTH_UPDATE_PROFILE, data);
  },

  updateAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('AvatarFile', file);
    return request.post<ApiEnvelope>(KEYS.AUTH_UPDATE_AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: async (data: ChangePasswordRequest) => {
    return request.post<ApiEnvelope>(KEYS.AUTH_CHANGE_PASSWORD, data);
  },

  logout: async () => {
    return request.post<ApiEnvelope>(KEYS.AUTH_LOGOUT);
  },

  revokeToken: async () => {
    return request.post<ApiEnvelope>(KEYS.TOKEN_REVOKE);
  },
};
