"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

import { useCategories } from "@/apis/category/queries";

type Category = {
  id: string;
  name: string;
  children?: Category[];
};

export function CategorySection() {
  const { data: response } = useCategories({ type: "tree" });

  const rootCategories: Category[] =
    response?.data?.categories || [];

  const [selectedParent, setSelectedParent] =
    useState<Category | null>(null);

  const [activeTab, setActiveTab] = useState("");

  const displayCategories = useMemo(() => {
    if (selectedParent?.children?.length) {
      return selectedParent.children;
    }

    return rootCategories;
  }, [rootCategories, selectedParent]);

  return (
    <section className="mb-5 rounded-2xl border border-slate-100 bg-slate-50/40 px-1 py-6 sm:px-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-sky-600 sm:text-2xl md:text-3xl">
          Danh mục nổi bật
        </h2>

        {selectedParent && (
          <button
            onClick={() => setSelectedParent(null)}
            className="text-sm font-medium text-sky-600 hover:underline"
          >
            ← Quay lại
          </button>
        )}
      </div>

      <div className="relative mt-7">
        <Carousel opts={{ align: "start", dragFree: true }}>
          <CarouselContent className="-ml-4 px-1">
            {displayCategories.map((cat) => {
              const hasChildren =
                !!cat.children?.length;

              return (
                <CarouselItem
                  key={cat.id}
                  className="basis-[45%] xs:basis-[30%] sm:basis-[28%] md:basis-[21%] lg:basis-[15.5%] pl-4"
                >
                  <motion.button
                    onClick={() => {
                      setActiveTab(cat.name);

                      if (hasChildren) {
                        setSelectedParent(cat);
                      }
                    }}
                    className={cn(
                      "group flex h-full min-h-[106px] w-full flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-500 hover:cursor-pointer",
                      activeTab === cat.name
                        ? "border-sky-400 bg-gradient-to-b from-sky-50/70 to-white shadow-lg ring-1 ring-sky-200"
                        : "border-slate-200/70 hover:border-sky-300 hover:shadow-md"
                    )}
                  >
                    <p className="line-clamp-1 text-sm font-bold tracking-tight">
                      {cat.name}
                    </p>

                    <span className="mt-2 text-xs text-slate-500">
                      {hasChildren
                        ? "Xem danh mục con →"
                        : "Xem sản phẩm →"}
                    </span>
                  </motion.button>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious className="-left-5" />
          <CarouselNext className="-right-5" />
        </Carousel>
      </div>
    </section>
  );
}