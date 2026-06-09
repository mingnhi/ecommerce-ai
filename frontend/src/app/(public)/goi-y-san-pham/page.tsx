import type { Metadata } from "next";
import { Suspense } from "react";
import GoiYSanPhamPage from "@/modules/GoiYSanPhamPage";
import { GoiYSanPhamSkeleton } from "@/modules/GoiYSanPhamPage/components/Skeleton";
import { siteConfig } from "@/configs/site";

export const metadata: Metadata = {
  title: `Gợi ý sản phẩm — ${siteConfig.name}`,
  description: "Gợi ý sản phẩm cá nhân hóa dựa trên sở thích mua sắm của bạn",
};

export default function Page() {
  return (
    <Suspense fallback={<GoiYSanPhamSkeleton />}>
      <GoiYSanPhamPage />
    </Suspense>
  );
}
