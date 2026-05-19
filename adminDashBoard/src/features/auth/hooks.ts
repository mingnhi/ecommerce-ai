import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { getMe, login } from "@/services/auth";
import { storage } from "@/shared/lib/storage";
import { STORAGE_KEYS } from "@/shared/constants";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
};

type LoginBody = { email: string; password: string };

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  data?: LoginResponse;
};

function persistTokens(payload: unknown) {
  const raw = payload as LoginResponse;
  const nested = raw.data;
  const access =
    raw.accessToken ?? raw.token ?? nested?.accessToken ?? nested?.token;
  const refresh = raw.refreshToken ?? nested?.refreshToken;
  if (access) storage.set(STORAGE_KEYS.accessToken, access);
  if (refresh) storage.set(STORAGE_KEYS.refreshToken, refresh);
}

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginBody) => login(body),
    onSuccess: (data) => {
      persistTokens(data);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void navigate("/dashboard", { replace: true });
    },
  });
}

export function loginErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.response?.status === 401)
      return "Email hoặc mật khẩu không đúng.";
  }
  if (err instanceof Error) return err.message;
  return "Đăng nhập thất bại. Vui lòng thử lại.";
}
