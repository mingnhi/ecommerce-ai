import React from "react";
import { Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { useMe } from "@/features/auth/hooks";
import { clearAuthSession, hasAuthToken, isAdmin } from "@/features/auth/lib";
import { LoadingScreen } from "@/shared/components/common/LoadingScreen";

export { LoginPage };

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
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
};

export const PublicLoginRoute = ({ children }: { children: React.ReactNode }) => {
  if (hasAuthToken()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
