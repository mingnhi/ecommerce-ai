"use client";

import Image from "next/image";
import Link from "next/link";

import { useMyRecommendations } from "@/apis/user-event";

type Props = {
  limit?: number;
  showHeader?: boolean;
};

export default function RecommendSection({
  limit = 20,
  showHeader = true,
}: Props) {
  const { data, isLoading } = useMyRecommendations(limit);

  console.log(data?.recommendations);
  if (isLoading) {
    return (
      <section className="space-y-5">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold"> Sản phẩm dành cho bạn</h2>

              <p className="text-sm text-gray-500">AI Recommendation System</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border bg-white p-3"
            >
              <div className="h-44 w-full animate-pulse rounded-lg bg-gray-200" />

              <div className="mt-3 h-4 animate-pulse rounded bg-gray-200" />

              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!data?.recommendations?.length) {
    return (
      <section className="rounded-2xl border bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-semibold">Chưa có dữ liệu gợi ý</h2>

        <p className="mt-2 text-gray-500">
          Hãy xem thêm sản phẩm để AI hiểu sở thích của bạn.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold"> Sản phẩm dành cho bạn</h2>

            <p className="text-sm text-gray-500">
              Được đề xuất bằng AI Recommendation
            </p>
          </div>

          <Link
            href="/recommend"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Xem tất cả
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {data.recommendations.map((item) => (
          <Link
            key={item.id}
            href={`/san-pham/${item.slug ?? item.id}`}
            className="group overflow-hidden rounded-xl border bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="space-y-2 p-3">
              <h3 className="line-clamp-2 min-h-[48px] text-sm font-semibold">
                {item.name}
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-red-500">
                  {Number(item.price).toLocaleString("vi-VN")}đ
                </span>
              </div>

              {item.recommendScore && (
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                    AI Score
                  </span>

                  <span className="text-xs font-semibold text-green-600">
                    {item.recommendScore.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
