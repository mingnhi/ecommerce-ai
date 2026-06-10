"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useMyRecommendations } from "@/apis/user-event";
import { ROUTES } from "@/lib/routes";
import { ProductCard } from "@/modules/HomePage/components/ProductCard";
import { GoiYSanPhamSkeleton } from "@/modules/GoiYSanPhamPage/components/Skeleton";

type Props = {
  limit?: number;
};

export default function RecommendSection({ limit = 10 }: Props) {
  const { data, isLoading } = useMyRecommendations(limit);
  const products = useMemo(
    () => data?.recommendations ?? [],
    [data?.recommendations],
  );

  if (isLoading) {
    return (
      <section className="space-y-5">
        <SectionHeader />
        <GoiYSanPhamSkeleton withHeader={false} />
      </section>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className="space-y-5">
      <SectionHeader />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-sky-600 ">Sản phẩm dành cho bạn</h2>
       
      </div>
      <Link
        href={ROUTES.GOI_Y_SAN_PHAM}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg  px-4  text-sm font-medium text-sky-600 transition-colors"
      >
        Xem tất cả
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
