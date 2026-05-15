"use client";

import { useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderCard } from "./components/OrderCard";
import { cn } from "@/lib/utils";
import { MOCK_ORDERS } from "@/faker/mock-orders";
import { useOrderTabsSticky } from "./hooks/use-order-tabs-sticky";
import { HEADER_HEIGHT } from "@/stores/layout/constants";

const orderTabs = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ thanh toán" },
  { value: "shipping", label: "Vận chuyển" },
  { value: "delivered", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "returned", label: "Trả hàng/Hoàn tiền" },
];

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { sentinelRef, isPinned } = useOrderTabsSticky();

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MOCK_ORDERS.filter((order) => {
      const matchesTab = activeTab === "all" || order.status === activeTab;
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.products.some((p) => p.name.toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-auto  pb-6">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="space-y-3">
          <div ref={sentinelRef} className="h-px w-full" aria-hidden />

          <div
            className={cn(
              "sticky z-40 rounded-sm border border-border/50 bg-card p-1 transition-shadow",
              isPinned && "shadow-md"
            )}
            style={{ top: isPinned ? 0 : HEADER_HEIGHT }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full flex-wrap justify-start gap-1 overflow-x-auto bg-transparent p-0 scrollbar-hide sm:flex-nowrap">
                {orderTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "min-w-fit flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                      "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
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
              className="h-12 w-full rounded-sm border-border/60 bg-card pl-11 shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-sm border border-dashed border-border/60 bg-card/50 px-4 py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted/50">
                  <ShoppingBag className="size-8 text-muted-foreground/50" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">
                  Không tìm thấy đơn hàng
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Chưa có đơn hàng nào phù hợp với tìm kiếm hoặc bộ lọc của bạn. Vui lòng thử lại.
                </p>
              </div>
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
