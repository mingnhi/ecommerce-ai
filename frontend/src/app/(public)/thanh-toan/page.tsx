import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutPage from "@/modules/CheckoutPage";
import { CheckoutSkeleton } from "@/modules/CheckoutPage/components/Skeleton";
import { siteConfig } from "@/configs/site";

export const metadata: Metadata = {
  title: `Thanh toán — ${siteConfig.name}`,
  description: "Thanh toán đơn hàng của bạn",
};

export default function Page() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutPage />
    </Suspense>
  );
}
