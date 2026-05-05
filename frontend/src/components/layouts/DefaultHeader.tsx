"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useAppSelector } from "@/stores";
import { selectUser, selectAccessToken } from "@/stores/user/selectors";
import { useLogout } from "@/hooks/use-logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/api-assets";
import { siteConfig } from "@/configs/site";

export function DefaultHeader() {
  const { handleLogout } = useLogout();
  const user = useAppSelector(selectUser);
  const accessToken = useAppSelector(selectAccessToken);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLoggedIn = !!accessToken;
  const userName =
    user
      ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.name ||
        undefined
      : undefined;

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 z-50 py-1">
      <div className="mx-auto flex items-center justify-between py-1 px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center gap-6">
          <Link
            href={ROUTES.HOME}
            className="items-center gap-2 cursor-pointer shrink-0 w-15 md:w-30 flex"
          >
            <span className="text-lg font-bold tracking-tight text-gray-900">
              {siteConfig.name}
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href={ROUTES.HOME}
              className="text-gray-700 font-semibold hover:text-primary transition"
            >
              Trang chủ
            </Link>
          </nav>
        </div>

        {mounted && isLoggedIn ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Avatar className="h-8 w-8 border border-gray-300">
                <AvatarImage src={getImageUrl(user?.image)} alt={userName} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {userName ? userName.charAt(0).toUpperCase() : "…"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-medium max-w-[160px] truncate">
                {userName ?? "Tài khoản"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1"
              onClick={() => handleLogout()}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button asChild variant="default" className="rounded-full">
              <Link href={ROUTES.LOGIN}>Đăng nhập</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={ROUTES.REGISTER}>Đăng ký</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
