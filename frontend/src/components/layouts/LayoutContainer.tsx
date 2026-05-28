"use client";

import React, { memo, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { DefaultLayout } from "./DefaultLayout";

type LayoutKind = "none" | "default";

const NO_CHROME_PREFIXES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.VERIFY_OTP,
  ROUTES.FORGOT_PASSWORD,
  "/dang-nhap",
  "/dang-ky",
  "/page403",
  "/page404",
] as const;

export function isNoChromeRoute(pathname: string): boolean {
  return NO_CHROME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function resolveLayout(pathname: string): LayoutKind {
  if (isNoChromeRoute(pathname)) return "none";
  return "default";
}

function LayoutContainerImpl({ children }: React.PropsWithChildren) {
  const pathname = usePathname() ?? "/";
  const kind = useMemo(() => resolveLayout(pathname), [pathname]);

  if (kind === "none") return <>{children}</>;

  return <DefaultLayout>{children}</DefaultLayout>;
}

const LayoutContainer = memo(LayoutContainerImpl);

LayoutContainer.displayName = "LayoutContainer";

export default LayoutContainer;
