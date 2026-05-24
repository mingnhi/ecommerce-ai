export const KEYS = {
  AUTH_LOGIN: '/auth/login',
  AUTH_GOOGLE: '/auth/google',
  AUTH_REGISTER: '/auth/register',
  AUTH_ME: '/auth/me',
  AUTH_PROFILE: '/auth/profile',
  AUTH_PROFILE_AVATAR: '/auth/profile/avatar',
  AUTH_PASSWORD: '/auth/password',
  AUTH_LOGOUT: '/auth/logout',
  OTP_VERIFY_REGISTER: '/otp/verify-register',
  OTP_RESEND: '/otp/resend',
  TOKEN_REFRESH: '/token/refresh',
  TOKEN_REVOKE: '/token/revoke',
} as const;
