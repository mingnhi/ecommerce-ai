import React from "react";
import { Navigate } from "react-router-dom";
import { storage } from "@/shared/lib/storage";
import { STORAGE_KEYS } from "@/shared/constants";

const hasToken = () => Boolean(storage.get<string>(STORAGE_KEYS.accessToken));

export const LoginPage = () => <div>Login Page</div>;

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // if (!hasToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const PublicLoginRoute = ({ children }: { children: React.ReactNode }) => {
  if (hasToken()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
