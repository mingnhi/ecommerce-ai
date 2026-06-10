"use client";

import { useEffect, useMemo, useRef } from "react";
import { Package, UserRound } from "lucide-react";
import { useInfiniteMyRecommendations } from "@/apis/user-event";
import { ProductCard } from "@/modules/HomePage/components/ProductCard";
import { EmptyState } from "./components/EmptyState";
import { GoiYSanPhamSkeleton } from "./components/Skeleton";

const PAGE_SIZE = 20;

export default function GoiYSanPhamPage() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteMyRecommendations(PAGE_SIZE);

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.recommendations) ?? [],
    [data],
  );

  const firstPage = data?.pages[0];
  const total = firstPage?.meta.totalItems ?? 0;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className=" bg-slate-50/60">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
        {isLoading ? (
          <GoiYSanPhamSkeleton />
        ) : (
          <>
            <header className="mb-8">
              <div className="flex flex-row justify-between border-b border-sky-200/70 pb-8">
                <div>
                  <p className="text-xs font-medium uppercase text-sky-600">Gợi ý cá nhân</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-sky-500 sm:text-4xl">
                    Sản phẩm dành cho bạn
                  </h1>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-500">
                    Danh sách được tuyển chọn theo hành vi xem, thêm giỏ và mua hàng — cập nhật
                    liên tục theo sở thích của bạn.
                  </p>
                </div>

                {total > 0 ? (
                  <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Package className="size-4 text-sky-500" />
                    <span>
                      <strong className="font-semibold text-slate-800">{total}</strong> sản phẩm
                      gợi ý
                    </span>
                  </div>
                ) : null}
              </div>

              
            </header>

            {total === 0 ? (
              <EmptyState />
            ) : (
              <section className="rounded-xl border border-sky-200/70 bg-white p-4 sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xs font-medium uppercase  text-sky-700">
                    Bộ sưu tập gợi ý
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {hasNextPage ? (
                  <div ref={sentinelRef} className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-4/5 animate-pulse rounded-2xl border border-slate-100 bg-slate-100"
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
