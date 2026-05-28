"use client";

import React, { memo, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { DefaultLayout } from "./DefaultLayout";

type LayoutKind = "none" | "default";

const startsWithAny = (pathname: string, prefixes: readonly string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(p));

function resolveLayout(pathname: string): LayoutKind {
  const noLayoutPrefixes = ["/dang-nhap", "/dang-ky", "/page403", "/page404"] as const;
  if (startsWithAny(pathname, noLayoutPrefixes)) return "none";

const NO_CHROME_PREFIXES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.VERIFY_OTP,
  ROUTES.FORGOT_PASSWORD,
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
