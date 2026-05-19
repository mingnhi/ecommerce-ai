import type { Metadata } from "next";
import { Suspense } from "react";
import OrderHistoryPage from "@/modules/OrderHistoryPage";
import { OrderHistorySkeleton } from "@/modules/OrderHistoryPage/components/Skeleton";
import { siteConfig } from "@/configs/site";

export const metadata: Metadata = {
  title: `Lịch sử đơn hàng — ${siteConfig.name}`,
  description: "Quản lý đơn hàng của bạn",
};

export default function Page() {
  return (
    <Suspense fallback={<OrderHistorySkeleton />}>
      <OrderHistoryPage />
    </Suspense>
  );
}
