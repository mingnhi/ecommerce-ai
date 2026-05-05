export type UserRole = 'admin' | 'user' | 'company';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
    confirmPassword?: string;
    companyId?: string;
    newCompanyName?: string;
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

export interface AuthResponse {
    succeeded?: boolean;
    status?: boolean;
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
