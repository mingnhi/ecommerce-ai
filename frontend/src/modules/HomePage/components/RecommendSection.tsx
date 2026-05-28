"use client";

import Image from "next/image";
import Link from "next/link";

import { useMyRecommendations } from "@/apis/user-event";

export default function RecommendSection() {
  const { data, isLoading } = useMyRecommendations(20);
  console.log("RECOMMEND COMPONENT RENDER");
  console.log(data);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Sản phẩm dành cho bạn</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="border rounded-xl p-3 animate-pulse">
              <div className="w-full h-40 bg-gray-200 rounded-lg" />

              <div className="h-4 bg-gray-200 rounded mt-3" />

              <div className="h-4 bg-gray-200 rounded mt-2 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!data?.recommendations || data.recommendations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sản phẩm dành cho bạn</h2>

        <span className="text-sm text-gray-500">
          {data.total_products} sản phẩm
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data.recommendations.map((item) => (
          <Link
            key={item.id}
            href={`/san-pham/${item.id}`}
            className="border rounded-xl p-3 hover:shadow-lg transition-all"
          >
            <div className="relative w-full h-44">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            <h3 className="font-semibold mt-3 line-clamp-2 min-h-[48px]">
              {item.name}
            </h3>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-red-500 font-bold">
                {Number(item.price).toLocaleString("vi-VN")}đ
              </p>

              <span className="text-xs text-gray-400">
                AI: {item.recommendScore?.toFixed(2)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
