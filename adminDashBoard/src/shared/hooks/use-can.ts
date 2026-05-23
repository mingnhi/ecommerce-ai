import { useMe } from "@/features/auth/hooks";
import { includesPermission } from "@/shared/lib/casl/permissions";

export function useUserPermissions() {
  const { data: user } = useMe();
  return user?.permissions ?? [];
}

export function useCan(permission: string) {
  const permissions = useUserPermissions();
  return includesPermission(permissions, permission);
}
