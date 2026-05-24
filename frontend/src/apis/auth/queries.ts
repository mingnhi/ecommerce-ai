import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AuthService } from './requests';
import { LoginRequest, RegisterRequest, UserResponse, UpdateProfileRequest, UpdatePasswordRequest, UserProfileResponse } from './types';
import { useAppDispatch, useAppSelector, store } from '@/stores';
import { loginAction, loginSuccessAction, loginFailureAction } from '@/stores/auth/actions';
import { setUserAction, setAccessTokenAction, setRefreshTokenAction, clearUserAction } from '@/stores/user/actions';
import { selectUser, selectAccessToken } from '@/stores/user/selectors';
import { getRoleFromToken } from '@/utils/jwt';
import { KEYS } from './keys';
import { IUser } from '@/types/user';
import { getApiErrorMessage, getEnvelopeData, isApiSuccess } from '@/lib/api-response';

function applyProfileToStore(profile: UserProfileResponse) {
  const current = store.getState().user.user;
  if (!current) return;

  store.dispatch(setUserAction({
    ...current,
    ...(profile.fullName !== undefined && { fullName: profile.fullName }),
    ...(profile.avatarUrl && { image: profile.avatarUrl }),
  }));
}

export const useLogin = () => {
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            return await AuthService.login(credentials);
        },
        onMutate: (credentials: LoginRequest) => {
            dispatch(loginAction(credentials));
        },
        onSuccess: (response: import('./types').AuthResponse) => {
            if (isApiSuccess(response) && response.data) {
                dispatch(loginSuccessAction(response.data));

                if (response.data.token) {
                    dispatch(setAccessTokenAction(response.data.token));
                }
                if (response.data.refreshToken) {
                    dispatch(setRefreshTokenAction(response.data.refreshToken));
                }
                if (response.data.user) {
                    const serverUser = response.data.user as any;
                    const token = response.data.token;
                    dispatch(setUserAction({
                        id: serverUser.id || '',
                        email: serverUser.email || '',
                        fullName: serverUser.fullName,
                        image: serverUser.image || serverUser.avatar,
                        roles: getRoleFromToken(token) ?? undefined,
                    }));
                    AuthService.me()
                        .then((meResponse) => {
                            if (isApiSuccess(meResponse) && meResponse.data) {
                                const d = meResponse.data;
                                const currentToken = store.getState().user.accessToken;
                                dispatch(setUserAction({
                                    id: d.id || '',
                                    email: d.email || '',
                                    fullName: d.fullName,
                                    phoneNumber: d.phoneNumber,
                                    introduction: d.introduction,
                                    image: d.avatar || d.image,
                                    roles: getRoleFromToken(currentToken) ?? undefined,
                                }));
                            }
                        })
                        .catch(() => { });
                }
            } else {
                const error = { messages: response.messages || ['Đăng nhập thất bại'] };
                dispatch(loginFailureAction(error));
            }
        },
        onError: (error: any) => {
            const errorMessages = error.response?.data?.messages || ['Đăng nhập thất bại'];
            dispatch(loginFailureAction({ messages: errorMessages }));
        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: (credentials: RegisterRequest) => AuthService.register(credentials),
    });
};

export const useVerifyRegisterOtp = () => {
    return useMutation({
        mutationFn: (payload: import('./types').VerifyOtpRequest) =>
            AuthService.verifyRegisterOtp(payload),
    });
};

export const useResendRegisterOtp = () => {
    return useMutation({
        mutationFn: (email: string) => AuthService.resendRegisterOtp(email),
    });
};

export const useMe = (options?: { refetchProfile?: boolean; enabled?: boolean }) => {
    const dispatch = useAppDispatch();
    const accessToken = useAppSelector(selectAccessToken);
    const user = useAppSelector(selectUser);
    const shouldFetch = options?.refetchProfile ? !!accessToken : !!accessToken && !user;
    const enabled = options?.enabled !== false && shouldFetch;

    const { data: response } = useQuery({
        queryKey: [KEYS.AUTH_ME],
        queryFn: async () => {
            return await AuthService.me();
        },
        enabled,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    useEffect(() => {
        if (isApiSuccess(response) && response.data) {
            const token = store.getState().user.accessToken;
            const d = response.data;
            dispatch(setUserAction({
                id: d.id || '',
                email: d.email || '',
                fullName: d.fullName,
                phoneNumber: d.phoneNumber,
                introduction: d.introduction,
                image: d.avatar || d.image,
                roles: getRoleFromToken(token) ?? undefined,
            }));
        }
    }, [response, dispatch]);
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: [KEYS.AUTH_PROFILE],
    queryFn: () => AuthService.getProfile(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useSyncProfileToStore = () => {
  const { data } = useGetProfile();

  useEffect(() => {
    const profile = getEnvelopeData<UserProfileResponse>(data);
    if (profile?.avatarUrl || profile?.fullName) applyProfileToStore(profile);
  }, [data]);
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => AuthService.updateProfile(data),
    onSuccess: (response) => {
      const profile = getEnvelopeData<UserProfileResponse>(response);
      if (profile) {
        applyProfileToStore(profile);
        queryClient.setQueryData([KEYS.AUTH_PROFILE], response);
      }
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => AuthService.updateAvatar(file),
    onSuccess: (response) => {
      const profile = getEnvelopeData<UserProfileResponse>(response);
      if (!profile?.avatarUrl) {
        toast.error('Cập nhật avatar thất bại.');
        return;
      }

      applyProfileToStore(profile);
      queryClient.setQueryData([KEYS.AUTH_PROFILE], response);
      toast.success('Cập nhật avatar thành công!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Cập nhật avatar thất bại.'));
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => AuthService.updatePassword(data),
  });
};

export const useLogout = () => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();

    const logout = useCallback(async () => {
        try {
            await AuthService.logout();
        } catch {
            // Ignore errors - still clear local state
        } finally {
            dispatch(clearUserAction());
            queryClient.clear();
        }
    }, [dispatch, queryClient]);

    return { logout };
};
