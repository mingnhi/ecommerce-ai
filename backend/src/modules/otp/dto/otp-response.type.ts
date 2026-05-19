// src/modules/otp/types/otp-response.type.ts
import { OtpType } from '../otp.enum';
import { UserStatus } from '@modules/users/use.enum';
import { User } from '@entities/user.entity';
import { Loaded } from '@mikro-orm/core';

export interface CreateOtpResponse {
    email: string;
    type: OtpType;
    otp: number;
    expiresAt: Date;
}

export interface VerifyOtpResponse {
    user: Loaded<User, never, '*', never>;
    email: string;
    type: OtpType;
    verified: boolean;
}

export interface ResendOtpResponse {
    message: string;
    email: string;
    type: OtpType;
    expiresAt: Date;
}

export interface VerifyRegisterOtpResponse {
    id: string;
    email: string;
    fullName: string;
    status: UserStatus;
    verified: boolean;
}

export interface ForgotPasswordOtpResponse {
    message: string;
}

export interface RemoveExpiredOtpResponse {
    deleted: number;
}