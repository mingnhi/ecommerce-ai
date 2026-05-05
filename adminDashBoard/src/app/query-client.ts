import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error: unknown) => {
        const axiosError = error as AxiosError;
        if (axiosError?.response?.status === 401) return false;
        return count < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: 0,
    },
  },
});
