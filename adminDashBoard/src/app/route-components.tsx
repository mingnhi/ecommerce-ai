import { Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { useMe } from "@/features/auth/hooks";
import {
  clearAuthSession,
  hasAuthToken,
  isAdmin,
} from "@/features/auth/lib";
import { useCan } from "@/shared/hooks/use-can";
import { LoadingScreen } from "@/shared/components/common/LoadingScreen";

export { LoginPage };

type RouteProps = {
  children: React.ReactNode;
};

export function PrivateRoute({ children }: RouteProps) {
  const authenticated = hasAuthToken();
  const { data: user, isLoading, isError } = useMe();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading && !user) {
    return (
      <LoadingScreen
        message="Bảo mật kết nối"
        description="Xác thực quyền quản trị..."
      />
    );
  }

  if (isError || !user || !isAdmin(user)) {
    clearAuthSession();
    return <Navigate to="/login?error=unauthorized" replace />;
  }

  return <>{children}</>;
}

export function PublicLoginRoute({ children }: RouteProps) {
  if (hasAuthToken()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

type PermissionRouteProps = RouteProps & {
  permission: string;
};

export function PermissionRoute({ permission, children }: PermissionRouteProps) {
  if (!useCan(permission)) {
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
}
