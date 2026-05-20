export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  status: string;
  roles: string[];
};

export type LoginPayload = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type ApiEnvelope<T> = {
  status?: string;
  message?: string;
  data?: T | ApiEnvelope<T>;
};
