"use client";

import React, { memo, useMemo } from "react";
import { usePathname } from "next/navigation";
import { DefaultLayout } from "./DefaultLayout";

type LayoutKind = "none" | "default";

const startsWithAny = (pathname: string, prefixes: readonly string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(p));

function resolveLayout(pathname: string): LayoutKind {
  const noLayoutPrefixes = ["/dang-nhap", "/dang-ky", "/page403", "/page404"] as const;
  if (startsWithAny(pathname, noLayoutPrefixes)) return "none";

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

