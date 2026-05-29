"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, Key, LogOut, Minus, Package, Plus, Search, ShoppingBag, Ticket, Trash2, User } from "lucide-react";
import { ProductPhoto } from "@/modules/HomePage/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useAppSelector } from "@/stores";
import { selectUser, selectAccessToken } from "@/stores/user/selectors";
import { useLogout } from "@/hooks/use-logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/api-assets";
import { siteConfig } from "@/configs/site";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatVnd } from "@/lib/format-currency";
import { buildProductPageUrl } from "@/modules/ProductPage/lib";
import { useCartContext } from "@/contexts";
import { MOCK_NOTIFICATIONS } from "@/faker/mock-notifications";
import { cn } from "@/lib/utils";
import type { CartLine } from "@/apis/cart/types";

const headerDropdownScroll22 = cn(
  "h-auto max-h-[min(22rem,calc(100vh-12rem))]",
  "[&_[data-slot=scroll-area-viewport]]:h-auto",
  "[&_[data-slot=scroll-area-viewport]]:max-h-[min(22rem,calc(100vh-12rem))]",
);

const headerDropdownScroll24 = cn(
  "h-auto max-h-[min(24rem,calc(100vh-12rem))]",
  "[&_[data-slot=scroll-area-viewport]]:h-auto",
  "[&_[data-slot=scroll-area-viewport]]:max-h-[min(24rem,calc(100vh-12rem))]",
);

function HeaderCartDropdown() {
  const { items, totalQuantity, subtotal, setLineQuantity, removeLine } = useCartContext();
  const badge =
    totalQuantity > 99 ? "99+" : totalQuantity > 0 ? String(totalQuantity) : null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="hover:shadow-none">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 shrink-0 cursor-pointer rounded-full text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Giỏ hàng"
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={2} />
          {badge && (
            <Badge
              variant="default"
              className={cn(
                "pointer-events-none absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums shadow-sm",
                "border-2 border-white"
              )}
            >
              {badge}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(calc(100vw-1.5rem),22rem)] overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 p-0 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95"
        maxHeight="none"
      >
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-4 py-3 dark:border-neutral-800 dark:from-neutral-900/80 dark:to-neutral-950">
          <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100">Giỏ hàng</p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {totalQuantity === 0
              ? "Chưa có sản phẩm"
              : `${items.length} mặt hàng · ${totalQuantity} sản phẩm`}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-neutral-500">
              <ShoppingBag className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Thêm sản phẩm để xem tại đây
            </p>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href={ROUTES.HOME}>Tiếp tục mua sắm</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className={headerDropdownScroll22}>
              <ul className="space-y-0 p-2">
                {items.map((line: CartLine) => {
                  const lineTotal = line.price * line.quantity;
                  return (
                    <li
                      key={line.id}
                      className="group rounded-xl border border-transparent p-2 transition-colors hover:border-gray-100 hover:bg-gray-50/80 dark:hover:border-neutral-800 dark:hover:bg-neutral-900/50"
                    >
                      <div className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200/60 dark:bg-neutral-800 dark:ring-neutral-700">
                          <ProductPhoto
                            src={getImageUrl(line.image) ?? line.image ?? ""}
                            alt={line.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900 dark:text-neutral-100">
                            {line.name}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-medium text-gray-600 dark:text-neutral-300">
                              {formatVnd(line.price)}
                              <span className="text-gray-400 dark:text-neutral-500"> / SP</span>
                            </p>
                            <Badge
                              variant="secondary"
                              className="h-6 rounded-md px-2 text-[11px] font-semibold tabular-nums"
                            >
                              ×{line.quantity}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 cursor-pointer rounded-md"
                                onClick={() => void setLineQuantity(line.id, line.quantity - 1)}
                                aria-label="Giảm"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <span className="min-w-8 text-center text-xs font-semibold tabular-nums text-gray-800 dark:text-neutral-200">
                                {line.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 cursor-pointer rounded-md"
                                onClick={() => void setLineQuantity(line.id, line.quantity + 1)}
                                aria-label="Tăng"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-neutral-100">
                                {formatVnd(lineTotal)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 cursor-pointer text-gray-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400 hover:cursor-pointer"
                                onClick={() => void removeLine(line.id)}
                                aria-label="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
            <Separator />
            <div className="space-y-3 bg-gray-50/50 px-4 py-3 dark:bg-neutral-900/40">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-neutral-400">Tạm tính</span>
                <span className="text-base font-bold tabular-nums text-gray-900 dark:text-neutral-50">
                  {formatVnd(subtotal)}
                </span>
              </div>
              <Button asChild className="w-full rounded-xl font-semibold shadow-sm bg-sky-500 text-white hover:bg-sky-600" size="sm">
                <Link href={ROUTES.CART}>Xem giỏ hàng</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeaderNotificationDropdown() {
  const [notifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="hover:shadow-none">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 shrink-0 cursor-pointer rounded-full text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                "pointer-events-none absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums shadow-sm",
                "border-2 border-white bg-red-500 text-white hover:bg-red-500 dark:border-neutral-950"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(calc(100vw-1.5rem),24rem)] overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 p-0 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95"
        maxHeight="none"
      >
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-4 py-3 dark:border-neutral-800 dark:from-neutral-900/80 dark:to-neutral-950">
          <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100">Thông báo</p>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : "Bạn không có thông báo mới"}
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-neutral-500">
              <Bell className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Không có thông báo nào
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className={headerDropdownScroll24}>
              <ul className="space-y-0 p-2">
                {notifications.map((notification) => {
                  return (
                    <li
                      key={notification.id}
                      className={cn(
                        "group rounded-xl border border-transparent p-3 transition-colors hover:border-gray-100 hover:bg-gray-50/80 dark:hover:border-neutral-800 dark:hover:bg-neutral-900/50 cursor-pointer relative",
                        !notification.isRead ? "bg-sky-50/40 dark:bg-sky-900/10" : ""
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
                          notification.type === 'order' ? 'bg-sky-500' :
                          notification.type === 'promotion' ? 'bg-rose-500' : 'bg-amber-500'
                        )}>
                          {notification.type === 'order' ? <Package className="h-5 w-5" /> :
                           notification.type === 'promotion' ? <Ticket className="h-5 w-5" /> :
                           <Bell className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "text-sm leading-snug text-gray-900 dark:text-neutral-100 mb-1 pr-4",
                            !notification.isRead ? "font-semibold" : "font-medium"
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-2">
                            {notification.content}
                          </p>
                          <p className="text-[11px] font-medium text-gray-400 dark:text-neutral-500 mt-1.5">
                            {new Date(notification.createdAt).toLocaleDateString('vi-VN', {
                              hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                            })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="absolute right-3 top-4 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
            <Separator />
            <div className="bg-gray-50/50 p-2 dark:bg-neutral-900/40">
              <Button asChild variant="ghost" className="w-full rounded-xl text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:text-sky-400 dark:hover:text-sky-300 dark:hover:bg-sky-900/20">
                <Link href={ROUTES.NOTIFICATIONS || "/notifications"}>
                  Xem tất cả thông báo
                </Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeaderSearchForm({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("search") ?? "";
  const [term, setTerm] = useState(queryFromUrl);

  useEffect(() => {
    setTerm(queryFromUrl);
  }, [queryFromUrl]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(buildProductPageUrl({ search: term, page: 1 }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full overflow-hidden rounded-md border border-sky-200 bg-white transition-colors focus-within:border-sky-500",
        className,
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="h-10 w-full border-0 bg-sky-50/50 pl-10 pr-3 text-sm text-sky-950 outline-none "
        />
      </div>
      <button
        type="submit"
        className="h-10 shrink-0 border-l border-sky-200 bg-sky-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-600 cursor-pointer sm:px-5"
      >
        Tìm kiếm
      </button>
    </form>
  );
}

export function DefaultHeader() {
  const { handleLogout } = useLogout();
  const user = useAppSelector(selectUser);
  const accessToken = useAppSelector(selectAccessToken);
  const avatarSrc = getImageUrl(user?.image);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = !!accessToken;

  const headerActions = !mounted ? (
    <div className="flex items-center gap-2 sm:gap-3">
      <HeaderCartDropdown />
    </div>
  ) : isLoggedIn ? (
    <div className="flex items-center gap-2 sm:gap-3">
      <HeaderNotificationDropdown />
      <HeaderCartDropdown />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full p-1.5 pr-3 text-gray-700 outline-none transition-colors hover:bg-sky-50 cursor-pointer">
            <Avatar className="h-8 w-8 border border-sky-100">
              <AvatarImage key={avatarSrc} src={avatarSrc} alt={user?.fullName} className="object-cover" />
              <AvatarFallback className="bg-sky-50 text-sky-600">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[150px] truncate text-sm font-medium md:inline">
              {user?.fullName ?? "Tài khoản"}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} maxHeight="none" className="w-64 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 p-0 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95">
          <div className="flex items-center gap-3 border-b border-gray-100 px-3 py-3 dark:border-neutral-800">
            <Avatar className="h-10 w-10 border border-gray-200 shadow-sm dark:border-neutral-700">
              <AvatarImage key={avatarSrc} src={avatarSrc} alt={user?.fullName} className="object-cover" />
              <AvatarFallback className="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-gray-900 dark:text-neutral-100">
                {user?.fullName ?? "Tài khoản"}
              </span>
              <span className="mt-0.5 truncate text-xs text-gray-500 dark:text-neutral-400">
                {user?.email ?? "Thành viên"}
              </span>
            </div>
          </div>
          <ScrollArea className="max-h-72">
            <div className="space-y-1 p-2">
              <Link href={ROUTES.PROFILE}>
                <DropdownMenuItem>
                  <User className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                  <span>Thông tin tài khoản</span>
                </DropdownMenuItem>
              </Link>
              <Link href={ROUTES.VOUCHERS}>
                <DropdownMenuItem>
                  <Ticket className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                  <span>Voucher của tôi</span>
                </DropdownMenuItem>
              </Link>
              <Link href={ROUTES.NOTIFICATIONS}>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                  <span>Thông báo</span>
                </DropdownMenuItem>
              </Link>
              <Link href={ROUTES.ORDER_HISTORY}>
                <DropdownMenuItem>
                  <Package className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                  <span>Lịch sử đơn hàng</span>
                </DropdownMenuItem>
              </Link>
              <Link href={ROUTES.CHANGE_PASSWORD}>
                <DropdownMenuItem>
                  <Key className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                  <span>Đổi mật khẩu</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem variant="destructive" onClick={() => handleLogout()}>
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Đăng xuất</span>
              </DropdownMenuItem>
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex items-center gap-2 sm:gap-3">
      <HeaderCartDropdown />
      <Button asChild variant="default" className="rounded-full bg-sky-500 hover:bg-sky-600">
        <Link href={ROUTES.LOGIN}>Đăng nhập</Link>
      </Button>
      <Button asChild variant="outline" className="rounded-full border-sky-200 text-sky-700 hover:bg-sky-50">
        <Link href={ROUTES.REGISTER}>Đăng ký</Link>
      </Button>
    </div>
  );

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-sky-100 bg-white" suppressHydrationWarning>
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6" suppressHydrationWarning>
        <Link href={ROUTES.HOME} className="flex shrink-0 items-center transition-opacity hover:opacity-90">
          <img
            src="/images/logo.png"
            alt="Ecommerce AI Logo"
            className="h-8 w-auto object-contain md:h-9"
          />
        </Link>

        <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-6">
          <Suspense
            fallback={
              <div className="h-10 w-full max-w-2xl animate-pulse rounded-md border border-sky-100 bg-sky-50/60" />
            }
          >
            <HeaderSearchForm className="max-w-2xl" />
          </Suspense>
        </div>

        <div className="flex shrink-0 items-center justify-end">{headerActions}</div>
      </div>
    </header>
  );
}
