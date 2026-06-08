'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts, useProductPriceRange } from '@/apis/product/queries';
import type { Product } from '@/apis/product/types';
import { AppPagination } from '@/components/common/AppPagination';
import { ProductCard } from '@/modules/HomePage/components/ProductCard';
import {
  buildProductPageUrl,
  parsePriceRange,
  parseProductSort,
  roundPriceBounds,
  type ProductSort,
} from './lib';
import { cn } from '@/lib/utils';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductSortBar } from './components/ProductSortBar';
import { ProductPageSkeleton } from './components/Skeleton';

const PAGE_SIZE = 20;

export default function ProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('category');
  const sort = parseProductSort(searchParams.get('sort'));
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const { data: priceRangeResponse } = useProductPriceRange();
  const priceBounds = useMemo(
    () =>
      roundPriceBounds(
        priceRangeResponse?.data ?? { min: 0, max: 10_000_000 },
      ),
    [priceRangeResponse?.data],
  );
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const hasPriceFilter = minPriceParam != null && maxPriceParam != null;
  const priceRange = parsePriceRange(
    minPriceParam,
    maxPriceParam,
    priceBounds,
  );

  const { data: response, isLoading, isFetching } = useProducts({
    search: searchQuery || undefined,
    categoryId: categoryId ?? undefined,
    sort,
    page,
    limit: PAGE_SIZE,
    isActive: true,
    ...(hasPriceFilter
      ? { minPrice: priceRange[0], maxPrice: priceRange[1] }
      : {}),
  });

  const products: Product[] = response?.data ?? [];
  const pagination = response?.meta;
  const totalItems = pagination?.totalItems ?? products.length;
  const totalPages = pagination?.totalPages ?? 1;

  const categoryName = useMemo(() => {
    if (!categoryId) return null;
    return products[0]?.category?.name ?? null;
  }, [categoryId, products]);

  const navigate = (updates: {
    search?: string;
    categoryId?: string | null;
    sort?: ProductSort;
    page?: number;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const nextMin = updates.minPrice ?? priceRange[0];
    const nextMax = updates.maxPrice ?? priceRange[1];

    router.push(
      buildProductPageUrl({
        search: updates.search ?? searchQuery,
        categoryId:
          updates.categoryId === undefined
            ? categoryId ?? undefined
            : updates.categoryId ?? undefined,
        sort: updates.sort ?? sort,
        page: updates.page ?? 1,
        minPrice: nextMin,
        maxPrice: nextMax,
        priceBounds,
      }),
    );
  };

  return (
    <div className="min-h-[calc(100vh-66px)] bg-slate-50/60 pb-12">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="sticky top-20 z-10 w-full shrink-0 self-start lg:w-[280px]">
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain rounded-md">
              <FilterSidebar
                selectedCategoryId={categoryId}
                onCategorySelect={(id) => navigate({ categoryId: id, page: 1 })}
                priceRange={priceRange}
                onPriceRangeCommit={([min, max]) =>
                  navigate({ minPrice: min, maxPrice: max, page: 1 })
                }
              />
            </div>
          </div>

          <main className="min-w-0 flex-1">
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-800">
                  {searchQuery
                    ? `Kết quả cho "${searchQuery}"`
                    : 'Tất cả sản phẩm'}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Tìm thấy <strong>{totalItems}</strong> sản phẩm
                  {categoryName ? ` · ${categoryName}` : ''}
                </p>
              </div>
              <ProductSortBar
                sort={sort}
                onSortChange={(next) => navigate({ sort: next, page: 1 })}
              />
            </div>

            {isLoading ? (
              <ProductPageSkeleton />
            ) : products.length > 0 ? (
              <>
                <div
                  className={cn(
                    'grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4',
                    isFetching && 'opacity-60',
                  )}
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <AppPagination
                  className="mt-8"
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(next) => navigate({ page: next })}
                />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
                <p className="text-lg font-medium text-slate-600">
                  Không tìm thấy sản phẩm
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Thử đổi từ khóa, khoảng giá hoặc danh mục khác
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
