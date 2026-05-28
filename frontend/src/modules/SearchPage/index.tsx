'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useProducts } from '@/apis/product/queries';
import type { Product } from '@/apis/product/types';

import { ProductCard } from '@/modules/HomePage/components/ProductCard';

type SortType =
  | 'newest'
  | 'oldest'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc';

export default function SearchPage() {
  const searchParams = useSearchParams();

  const queryParam =
    searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] =
    useState(queryParam);

  const [sort, setSort] =
    useState<SortType>('newest');

  const { data: response, isLoading } =
    useProducts({
      search: queryParam || undefined,
      limit: 24,
      sort,
    });

  const products: Product[] =
    response?.data || [];

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const url = searchTerm.trim()
      ? `/tim-kiem?q=${encodeURIComponent(
          searchTerm
        )}`
      : '/tim-kiem';

    window.history.pushState(
      null,
      '',
      url
    );
  };

  return (
    <div className="container mx-auto min-h-[70vh] px-4 py-8 pb-20">
      {/* ================= HEADER ================= */}
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold text-slate-900">
          Tìm kiếm sản phẩm
        </h1>

        {queryParam && (
          <p className="text-lg text-slate-600">
            Kết quả tìm kiếm cho:{' '}
            <strong>
              "{queryParam}"
            </strong>
          </p>
        )}
      </div>

      {/* ================= SEARCH FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-10 max-w-2xl"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            placeholder="Nhập tên sản phẩm..."
            className="flex-1 rounded-2xl border border-slate-200 px-6 py-4 text-lg outline-none focus:border-sky-500"
          />

          <button
            type="submit"
            className="rounded-2xl bg-sky-600 px-10 font-semibold text-white transition-colors hover:bg-sky-700"
          >
            Tìm
          </button>
        </div>
      </form>

      {/* ================= SORT ================= */}
      {!isLoading &&
        products.length > 0 && (
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Tìm thấy{' '}
              <strong>
                {products.length}
              </strong>{' '}
              sản phẩm
            </p>

            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target
                    .value as SortType
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-sky-500"
            >
              <option value="newest">
                Mới nhất
              </option>

              <option value="oldest">
                Cũ nhất
              </option>

              <option value="name_asc">
                Tên A-Z
              </option>

              <option value="name_desc">
                Tên Z-A
              </option>

              <option value="price_asc">
                Giá tăng dần
              </option>

              <option value="price_desc">
                Giá giảm dần
              </option>
            </select>
          </div>
        )}

      {/* ================= CONTENT ================= */}
      {isLoading ? (
        <SearchPageSkeleton />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : queryParam ? (
        <div className="py-24 text-center">
          <p className="mb-2 text-2xl text-slate-400">
            Không tìm thấy sản phẩm
          </p>

          <p className="text-slate-500">
            Vui lòng thử từ khóa khác
          </p>
        </div>
      ) : (
        <div className="py-20 text-center text-slate-500">
          Nhập từ khóa để bắt đầu tìm kiếm
        </div>
      )}
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({
        length: 12,
      }).map((_, i) => (
        <div
          key={i}
          className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border bg-white p-3 sm:p-4"
        >
          <div className="relative aspect-square rounded-xl bg-slate-200" />

          <div className="flex flex-1 flex-col pt-3">
            <div className="h-3 w-16 rounded bg-slate-200" />

            <div className="mt-2 h-5 w-4/5 rounded bg-slate-200" />

            <div className="mt-1 h-3 w-12 rounded bg-slate-200" />

            <div className="mt-auto flex items-end justify-between pt-4">
              <div className="space-y-1">
                <div className="h-6 w-20 rounded bg-slate-200" />

                <div className="h-3 w-14 rounded bg-slate-200" />
              </div>

              <div className="h-10 w-10 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

