export type UserRole = 'admin' | 'user' | 'company';

export interface LoginRequest {
    email: string;
    password: string;
}

export type RegisterRequest = {
    fullName: string;
    email: string;
    password: string;
};

export type VerifyOtpRequest = {
    email: string;
    otp: string;
};

export type AuthUser = {
    id: string;
    email: string;
    fullName: string;
    status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
    roles: string[];
};
export interface AuthError {
    messages: string[];
}

export type AuthResponse = {
    message: string;
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
};
// export interface UpdateProfileRequest {
//     firstName: string;
//     lastName: string;
//     email: string;
//     phoneNumber?: string;
//     introduction?: string;
// }

// export interface ChangePasswordRequest {
//     currentPassword: string;
//     newPassword: string;
//     logoutAllSessions?: boolean;
// }
