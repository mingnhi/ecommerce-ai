import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMe, login, logout as logoutApi } from "@/services/auth";
import {
  clearAuthSession,
  getCachedAuthUser,
  hasAuthToken,
  isAdmin,
  parseLoginErrorMessage,
  parseLoginPayload,
  parseMeUser,
  saveAuthSession,
} from "./lib";
import type { AuthUser } from "./types";

type LoginBody = { email: string; password: string };

const ME_KEY = ["me"] as const;

export const useMe = () => {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      const response = await getMe();
      const user = parseMeUser(response);
      if (!user) throw new Error("Unauthorized");
      return user;
    },
    enabled: hasAuthToken(),
    initialData: () => getCachedAuthUser() ?? undefined,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: false,
  });
};

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: LoginBody) => {
      const response = await login(body);
      const payload = parseLoginPayload(response);
      if (!payload) {
        throw new Error("Đăng nhập thất bại. Dữ liệu phản hồi không hợp lệ.");
      }
      if (!isAdmin(payload.user)) {
        throw new Error("Tài khoản không có quyền truy cập quản trị.");
      }
      return payload;
    },
    onSuccess: (payload) => {
      saveAuthSession(payload);
      queryClient.setQueryData<AuthUser>(ME_KEY, payload.user);
      void navigate("/dashboard", { replace: true });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutApi(),
    onSettled: () => {
      clearAuthSession();
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
}

export function loginErrorMessage(err: unknown): string {
  return parseLoginErrorMessage(err);
}
