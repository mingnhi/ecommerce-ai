import type { Metadata } from "next";
import { Suspense } from "react";
import CartPage from "@/modules/CartPage";
import { CartSkeleton } from "@/modules/CartPage/components/Skeleton";
import { siteConfig } from "@/configs/site";

export const metadata: Metadata = {
  title: `Giỏ hàng — ${siteConfig.name}`,
  description: "Giỏ hàng của bạn",
};

export default function Page() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartPage />
    </Suspense>
  );
}
