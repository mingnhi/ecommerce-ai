import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AuthService } from './requests';
import { LoginRequest, RegisterRequest, UserResponse, UpdateProfileRequest, ChangePasswordRequest } from './types';
import { useAppDispatch, useAppSelector, store } from '@/stores';
import { loginAction, loginSuccessAction, loginFailureAction } from '@/stores/auth/actions';
import { setUserAction, setAccessTokenAction, setRefreshTokenAction, clearUserAction } from '@/stores/user/actions';
import { selectUser, selectAccessToken } from '@/stores/user/selectors';
import { getRoleFromToken } from '@/utils/jwt';
import { KEYS } from './keys';
import { IUser } from '@/types/user';

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
            if (response && (response.succeeded === true || response.status === true) && response.data) {
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
                    const userData: IUser = {
                        id: serverUser.id || '',
                        email: serverUser.email || '',
                        firstName: serverUser.firstName || '',
                        lastName: serverUser.lastName || '',
                        name: `${serverUser.firstName || ''} ${serverUser.lastName || ''}`.trim() || undefined,
                        image: serverUser.image || serverUser.avatar,
                        roles: getRoleFromToken(token) ?? undefined,
                    };
                    dispatch(setUserAction(userData));
                    AuthService.me()
                        .then((meResponse) => {
                            if (meResponse?.data && (meResponse.succeeded === true || meResponse.status === true)) {
                                const d = meResponse.data;
                                const currentToken = store.getState().user.accessToken;
                                dispatch(setUserAction({
                                    id: d.id || '',
                                    email: d.email || '',
                                    firstName: d.firstName || '',
                                    lastName: d.lastName || '',
                                    phoneNumber: d.phoneNumber || '',
                                    introduction: d.introduction || '',
                                    name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || undefined,
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
        if (response && (response.succeeded === true || response.status === true) && response.data) {
            const token = store.getState().user.accessToken;
            const userData: IUser = {
                id: response.data.id || '',
                email: response.data.email || '',
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                phoneNumber: response.data.phoneNumber || '',
                introduction: response.data.introduction || '',
                name: `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim() || undefined,
                image: response.data.avatar || response.data.image,
                roles: getRoleFromToken(token) ?? undefined,
            };
            dispatch(setUserAction(userData));
        }
    }, [response, dispatch]);
};

export const useUpdateProfile = () => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateProfileRequest) => {
            return await AuthService.updateProfile(data);
        },
        onSuccess: async (response) => {
            if (response && (response.succeeded === true || response.status === true)) {
                await queryClient.invalidateQueries({ queryKey: [KEYS.AUTH_ME] });
                const meResponse = await AuthService.me();
                if (meResponse && (meResponse.succeeded === true || meResponse.status === true) && meResponse.data) {
                    const token = store.getState().user.accessToken;
                    const userData: IUser = {
                        id: meResponse.data.id || '',
                        email: meResponse.data.email || '',
                        firstName: meResponse.data.firstName || '',
                        lastName: meResponse.data.lastName || '',
                        phoneNumber: meResponse.data.phoneNumber || '',
                        introduction: meResponse.data.introduction || '',
                        name: `${meResponse.data.firstName || ''} ${meResponse.data.lastName || ''}`.trim() || undefined,
                        image: meResponse.data.avatar || meResponse.data.image,
                        roles: getRoleFromToken(token) ?? undefined,
                    };
                    dispatch(setUserAction(userData));
                }
            }
        },
    });
};

export const useUpdateAvatar = () => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            return await AuthService.updateAvatar(file);
        },
        onSuccess: async (response) => {
            if (response && (response.succeeded === true || response.status === true)) {
                toast.success("Cập nhật avatar thành công!");
                await queryClient.invalidateQueries({ queryKey: [KEYS.AUTH_ME] });
                const meResponse = await AuthService.me();
                if (meResponse && (meResponse.succeeded === true || meResponse.status === true) && meResponse.data) {
                    const token = store.getState().user.accessToken;
                    const userData: IUser = {
                        id: meResponse.data.id || '',
                        email: meResponse.data.email || '',
                        firstName: meResponse.data.firstName || '',
                        lastName: meResponse.data.lastName || '',
                        phoneNumber: meResponse.data.phoneNumber || '',
                        introduction: meResponse.data.introduction || '',
                        name: `${meResponse.data.firstName || ''} ${meResponse.data.lastName || ''}`.trim() || undefined,
                        image: meResponse.data.avatar || meResponse.data.image,
                        roles: getRoleFromToken(token) ?? undefined,
                    };
                    dispatch(setUserAction(userData));
                }
            } else {
                toast.error(response?.messages?.[0] || response?.message || "Cập nhật avatar thất bại.");
            }
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.messages?.[0] || error.response?.data?.message || "Cập nhật avatar thất bại.";
            toast.error(errorMessage);
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => AuthService.changePassword(data),
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
