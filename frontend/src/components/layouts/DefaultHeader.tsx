"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useAppDispatch, useAppSelector } from "@/stores";
import { store } from "@/stores";
import { selectUser, selectAccessToken } from "@/stores/user/selectors";
import { useLogout } from "@/hooks/use-logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/api-assets";
import { siteConfig } from "@/configs/site";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatVnd } from "@/lib/format-currency";
import { useCart } from "@/hooks/use-cart";
import { cartSlice } from "@/stores/cart/slice";
import { MOCK_PRODUCTS } from "@/faker/mock-products";
import { cn } from "@/lib/utils";
import type { ICartLine } from "@/types/cart";
import { selectSuppressHeader } from "@/stores/layout/selectors";

function HeaderCartDropdown() {
  const { items, totalQuantity, subtotal, setLineQuantity, removeLine } = useCart();
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
            <ScrollArea className="h-[min(22rem,calc(100vh-12rem))]">
              <ul className="space-y-0 p-2">
                {items.map((line: ICartLine) => {
                  const src = getImageUrl(line.image) ?? line.image ?? undefined;
                  const lineTotal = line.price * line.quantity;
                  return (
                    <li
                      key={line.id}
                      className="group rounded-xl border border-transparent p-2 transition-colors hover:border-gray-100 hover:bg-gray-50/80 dark:hover:border-neutral-800 dark:hover:bg-neutral-900/50"
                    >
                      <div className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200/60 dark:bg-neutral-800 dark:ring-neutral-700">
                          {src ? (
                            <Image
                              src={src}
                              alt={line.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <ShoppingBag className="h-6 w-6 opacity-40" strokeWidth={1.25} />
                            </div>
                          )}
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
                                onClick={() => setLineQuantity(line.id, line.quantity - 1)}
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
                                onClick={() => setLineQuantity(line.id, line.quantity + 1)}
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
                                className="h-8 w-8 shrink-0 cursor-pointer text-gray-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400"
                                onClick={() => removeLine(line.id)}
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
              <Button asChild className="w-full rounded-xl font-semibold shadow-sm" size="sm">
                <Link href={ROUTES.CART}>Xem giỏ hàng</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DefaultHeader() {
  const dispatch = useAppDispatch();
  const { handleLogout } = useLogout();
  const user = useAppSelector(selectUser);
  const accessToken = useAppSelector(selectAccessToken);
  const suppressHeader = useAppSelector(selectSuppressHeader);
  const [mounted, setMounted] = useState(false);
  const demoSeededRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || demoSeededRef.current) return;
    const id = window.setTimeout(() => {
      if (demoSeededRef.current) return;
      if (store.getState().cart.items.length > 0) return;
      demoSeededRef.current = true;
      MOCK_PRODUCTS.forEach((row) => {
        dispatch(cartSlice.actions.addLine(row));
      });
    }, 0);
    return () => window.clearTimeout(id);
  }, [mounted, dispatch]);

  const isLoggedIn = !!accessToken;
  const userName =
    user
      ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.name ||
        undefined
      : undefined;

  return (
    <header
      className={cn(
        "w-full bg-white shadow-sm fixed top-0 left-0 z-50 py-1 transition-transform duration-200",
        suppressHeader && "-translate-y-full pointer-events-none"
      )}
    >
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
          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderCartDropdown />
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
          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderCartDropdown />
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
