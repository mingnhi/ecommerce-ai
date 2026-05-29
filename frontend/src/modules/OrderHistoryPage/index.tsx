"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PackageSearch, Search, SearchX, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useOrderListQuery } from "@/apis/order";
import { ORDER_TAB_STATUS, mapApiOrder } from "@/lib/order";
import { OrderCard } from "./components/OrderCard";
import { OrderHistorySkeleton } from "./components/Skeleton";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { useOrderTabsSticky } from "@/hooks/use-order-tabs-sticky";

const orderTabs = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ thanh toán" },
  { value: "confirmed", label: "Đã thanh toán" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

type EmptyType = "all" | "tab" | "search";

const emptyContent: Record<
  EmptyType,
  { icon: typeof ShoppingBag; title: string; description: string }
> = {
  all: {
    icon: ShoppingBag,
    title: "Bạn chưa có đơn hàng nào",
    description: "Hãy mua sắm và đơn hàng của bạn sẽ hiển thị tại đây.",
  },
  tab: {
    icon: PackageSearch,
    title: "Không có đơn hàng ở trạng thái này",
    description: "Thử chọn tab khác để xem các đơn hàng của bạn.",
  },
  search: {
    icon: SearchX,
    title: "Không tìm thấy kết quả",
    description: "Thử tìm với từ khóa khác hoặc xóa bộ lọc tìm kiếm.",
  },
};

function OrderHistoryEmptyView({
  type,
  tabLabel,
  onClearSearch,
}: {
  type: EmptyType;
  tabLabel?: string;
  onClearSearch?: () => void;
}) {
  const { icon: Icon, title, description } = emptyContent[type];
  const desc =
    type === "tab" && tabLabel
      ? `Không có đơn hàng nào ở mục "${tabLabel}".`
      : description;

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-sm border border-dashed border-border/60 bg-card/50 px-6 py-14 text-center animate-in fade-in duration-300">
      <div className="relative inline-flex">
        <div className="absolute inset-0 rounded-full bg-sky-500/10 blur-2xl" />
        <div className="relative flex size-20 items-center justify-center rounded-full border border-sky-500/15 bg-background shadow-sm">
          <Icon className="size-9 text-sky-500/50" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {type === "search" && onClearSearch ? (
          <Button variant="outline" className="rounded-full" onClick={onClearSearch}>
            Xóa tìm kiếm
          </Button>
        ) : null}
        {type === "all" ? (
          <Button asChild className="rounded-full bg-sky-600 px-8 text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 hover:cursor-pointer">
            <Link href={ROUTES.HOME}>Mua sắm ngay</Link>
          </Button>
        ) : type === "tab" ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={ROUTES.HOME}>Tiếp tục mua sắm</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { sentinelRef, isPinned } = useOrderTabsSticky();

  const apiStatus = ORDER_TAB_STATUS[activeTab];
  const { data, isLoading, isError } = useOrderListQuery({
    status: apiStatus,
    limit: 50,
  });

  const orders = useMemo(
    () => (data?.items ?? []).map(mapApiOrder),
    [data?.items],
  );

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.products.some((p) => p.name.toLowerCase().includes(q)),
    );
  }, [orders, searchQuery]);

  const emptyType = useMemo<EmptyType | null>(() => {
    if (isLoading) return null;
    if (filteredOrders.length > 0) return null;
    if (searchQuery.trim()) return "search";
    if (activeTab !== "all") return "tab";
    return "all";
  }, [filteredOrders.length, searchQuery, activeTab, isLoading]);

  const activeTabLabel = orderTabs.find((t) => t.value === activeTab)?.label;

  if (isLoading) {
    return <OrderHistorySkeleton />;
  }

  return (
    <div className="min-h-auto pb-6">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="space-y-3">
          <div ref={sentinelRef} className="h-px w-full" aria-hidden />

          <div
            className={cn(
              "sticky top-[60px] z-40 rounded-sm border border-border/50 bg-card p-1 transition-shadow",
              isPinned && "shadow-md",
            )}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full flex-wrap justify-start gap-1 overflow-x-auto bg-transparent p-0 scrollbar-hide sm:flex-nowrap">
                {orderTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "min-w-fit flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                      "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:cursor-pointer",
                      "data-[state=active]:bg-sky-500/10 data-[state=active]:text-sky-600 data-[state=active]:shadow-none",
                    )}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-sm border-border/60 bg-card pl-11 shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-sky-500"
            />
          </div>

          {isError ? (
            <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              Không tải được danh sách đơn hàng. Vui lòng thử lại sau.
            </div>
          ) : null}

          <div className="space-y-4">
            {emptyType ? (
              <OrderHistoryEmptyView
                type={emptyType}
                tabLabel={activeTabLabel}
                onClearSearch={() => setSearchQuery("")}
              />
            ) : (
              <div className="flex flex-col gap-5">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
