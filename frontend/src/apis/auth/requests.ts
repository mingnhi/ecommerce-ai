import { request } from '../axios';
import { KEYS } from './keys';
import { LoginRequest, RegisterRequest, AuthResponse, UserResponse, UpdateProfileRequest, ChangePasswordRequest } from './types';

export const AuthService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await request.post<AuthResponse>(KEYS.AUTH_LOGIN, {
            email: data.email,
            password: data.password,
        });
        return response;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await request.post<AuthResponse>(KEYS.AUTH_REGISTER, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            role: data.role,
            companyId: data.companyId || undefined,
            newCompanyName: data.newCompanyName || undefined,
        });
        return response;
    },

    me: async (): Promise<{ succeeded?: boolean; status?: boolean; data?: UserResponse; messages?: string[] }> => {
        const response = await request.get<{ succeeded?: boolean; status?: boolean; data?: UserResponse; messages?: string[] }>(KEYS.AUTH_ME);
        return response;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<{ succeeded?: boolean; status?: boolean; message?: string; messages?: string[] }> => {
        const response = await request.put<{ succeeded?: boolean; status?: boolean; message?: string; messages?: string[] }>(KEYS.AUTH_UPDATE_PROFILE, data);
        return response;
    },

    updateAvatar: async (file: File): Promise<{ succeeded?: boolean; status?: boolean; message?: string; messages?: string[] }> => {
        const formData = new FormData();
        formData.append('AvatarFile', file);
        const response = await request.post<{ succeeded?: boolean; status?: boolean; message?: string; messages?: string[] }>(
            KEYS.AUTH_UPDATE_AVATAR,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response;
    },

    changePassword: async (data: ChangePasswordRequest): Promise<{ succeeded?: boolean; status?: boolean; message?: string; messages?: string[] }> => {
        const response = await request.post<{ succeeded?: boolean; status?: boolean; message?: string; messages?: string[] }>(
            KEYS.AUTH_CHANGE_PASSWORD,
            data
        );
        return response;
    },

    logout: async (): Promise<{ succeeded?: boolean; status?: boolean; message?: string; messages?: string[] }> => {
        const response = await request.post<{ succeeded?: boolean; status?: boolean; message?: string; messages?: string[] }>(KEYS.AUTH_LOGOUT);
        return response;
    },

    revokeToken: async (): Promise<{ succeeded?: boolean; status?: boolean; message?: string; messages?: string[] }> => {
        const response = await request.post<{ succeeded?: boolean; status?: boolean; message?: string; messages?: string[] }>(KEYS.TOKEN_REVOKE);
        return response;
    },
};

