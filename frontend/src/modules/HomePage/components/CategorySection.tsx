"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORY_TABS } from "@/faker/mock-categories";
import { cn } from "@/lib/utils";
import { HOME_CATEGORIES } from "../lib";

const CATEGORY_TAB_PREVIEW = CATEGORY_TABS.slice(0, 6);
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductPhoto } from "./ProductCard";

export function CategorySection() {
  const [activeTab, setActiveTab] = useState(CATEGORY_TAB_PREVIEW[0]);

  return (
    <section className="mb-5 rounded-2xl border border-slate-100 bg-slate-50/40 px-1 py-6 sm:px-2">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="shrink-0 text-xl font-semibold text-sky-600 sm:text-2xl md:text-3xl">Danh mục nổi bật</h2>
        <div className="flex gap-3 overflow-x-auto text-sm [-ms-overflow-style:none] [scrollbar-width:none] sm:ml-auto [&::-webkit-scrollbar]:hidden">
          {CATEGORY_TAB_PREVIEW.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "shrink-0 whitespace-nowrap transition-colors hover:text-sky-600",
                activeTab === tab ? "font-semibold text-sky-600" : "text-slate-500",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-7">
        <Carousel opts={{ align: "start", dragFree: true }}>
          <CarouselContent className="-ml-4 px-1">
            {HOME_CATEGORIES.map((cat) => (
              <CarouselItem
                key={cat.id}
                className="basis-[46%] pl-4 sm:basis-[31%] md:basis-[21%] lg:basis-[15.5%]"
              >
                <motion.button
                  type="button"
                  onClick={() => setActiveTab(cat.name)}
                  className={cn(
                    "group flex h-full min-h-[176px] w-full flex-col items-center rounded-xl border bg-white p-5 text-center transition-all duration-300 hover:cursor-pointer",
                    activeTab === cat.name
                      ? "border-sky-400 shadow-[0_14px_36px_-14px_rgba(14,165,233,0.45)] ring-1 ring-sky-200"
                      : "border-sky-200 border-slate-200/90 shadow-[0_4px_24px_-10px_rgba(15,23,42,0.1)] hover:shadow-[0_14px_32px_-14px_rgba(14,165,233,0.28)]",
                  )}
                >
                  <div
                    className={cn(
                      "mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-2xl ring-1 ring-white/80 sm:h-[84px] sm:w-[84px]",
                      cat.bgClass,
                    )}
                  >
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16">
                      <ProductPhoto
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        sizes="80px"
                      />
                    </div>
                  </div>
                  <p
                    className={cn(
                      "line-clamp-2 text-sm font-medium tracking-tight",
                      activeTab === cat.name ? "text-sky-700" : "text-slate-800 text-sky-600",
                    )}
                  >
                    {cat.name}
                  </p>
                  <span
                    className={cn(
                      "mt-2.5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide",
                      activeTab === cat.name
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-50 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600",
                    )}
                  >
                    {cat.itemCount} sản phẩm
                    <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                </motion.button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-5 hidden h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-sky-400 hover:bg-sky-500 hover:text-white md:flex" />
          <CarouselNext className="-right-5 hidden h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-sky-400 hover:bg-sky-500 hover:text-white md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
