"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Ticket, Bell, Clock, Lock } from "lucide-react";

import { useSyncProfileToStore } from "@/apis/auth/queries";
import { useAppSelector } from "@/stores";
import { selectUser } from "@/stores/user/selectors";
import { ROUTES } from "@/lib/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/api-assets";
import { cn } from "@/lib/utils";

export function AccountLayout({ children }: { children: React.ReactNode }) {
  useSyncProfileToStore();
  const user = useAppSelector(selectUser);
  const avatarSrc = getImageUrl(user?.image);
  const pathname = usePathname();

  const navItems = [
    {
      title: "Thông tin tài khoản",
      href: ROUTES.PROFILE,
      icon: User,
    },
    {
      title: "Voucher của tôi",
      href: ROUTES.VOUCHERS || "/voucher-cua-toi",
      icon: Ticket,
    },
    {
      title: "Thông báo",
      href: ROUTES.NOTIFICATIONS || "/thong-bao",
      icon: Bell,
    },
    {
      title: "Lịch sử đơn hàng",
      href: ROUTES.ORDER_HISTORY || "/lich-su-don-hang",
      icon: Clock,
    },
    {
      title: "Đổi mật khẩu",
      href: ROUTES.CHANGE_PASSWORD,
      icon: Lock,
    },
  ];

  return (
    <div className="bg-gray-50/50 dark:bg-neutral-950/50 min-h-[calc(100vh-66px)] py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-sky-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
              {/* User Info */}
              <div className="flex flex-col justify-center items-center gap-4 mb-3 pb-3 border-b border-gray-100 dark:border-neutral-800/80">
                <Avatar className="h-14 w-14 border-2 border-white shadow-md dark:border-neutral-800">
                  <AvatarImage key={avatarSrc} src={avatarSrc} alt={user?.fullName} className="object-cover" />
                  <AvatarFallback className="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-gray-900 dark:text-neutral-100 truncate text-base text-center">
                    {user?.fullName ?? "Tài khoản"}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-neutral-400 truncate text-center">
                    {user?.email ?? "Thành viên"}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col space-y-1.5 ">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden",
                        isActive
                          ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-200"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 dark:bg-sky-400 rounded-r-full" />
                      )}
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          isActive ? "text-sky-500 dark:text-sky-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 mt-4">
            <div className="w-full border border-sky-200/80 rounded-2xl shadow-sm">
              {children}
            </div>

          </main>
        </div>
      </div >
    </div >
  );
}
