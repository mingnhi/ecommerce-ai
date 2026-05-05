import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/auth";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
};