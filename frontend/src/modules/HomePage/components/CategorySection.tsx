"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CATEGORY_TABS } from "@/faker/mock-categories";
import { cn } from "@/lib/utils";
import { HOME_CATEGORIES } from "../lib";

const CATEGORY_TAB_PREVIEW = CATEGORY_TABS.slice(0, 6);
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export function CategorySection() {
  const [activeTab, setActiveTab] = useState(CATEGORY_TAB_PREVIEW[0]);

  return (
    <section className="mb-5 rounded-2xl border border-slate-100 bg-slate-50/40 px-1 py-6 sm:px-2">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="shrink-0 text-xl font-semibold text-sky-600 sm:text-2xl md:text-3xl">Danh mục nổi bật</h2>
        <div className="flex gap-3 overflow-x-auto text-sm [-ms-overflow-style:none] [scrollbar-width:none] sm:ml-auto [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
          {CATEGORY_TAB_PREVIEW.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "shrink-0 whitespace-nowrap transition-colors hover:text-sky-600 text-[13px] sm:text-sm cursor-pointer",
                activeTab === tab ? "font-semibold text-sky-600" : "text-slate-500",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-7">
        <Carousel opts={{ align: "start", dragFree: true, loop: true }}>
          <CarouselContent className="-ml-4 px-1">
            {HOME_CATEGORIES.map((cat) => (
              <CarouselItem
                key={cat.id}
                className="basis-[45%] xs:basis-[30%] sm:basis-[28%] md:basis-[21%] lg:basis-[15.5%] pl-4"
              >
                <motion.button
                  type="button"
                  onClick={() => setActiveTab(cat.name)}
                  className={cn(
                    "group flex h-full min-h-[106px] w-full flex-col justify-center items-center rounded-2xl border p-4 text-center transition-all duration-500 hover:cursor-pointer relative overflow-hidden",
                    activeTab === cat.name
                      ? "border-sky-400 bg-gradient-to-b from-sky-50/70 to-white shadow-[0_16px_32px_-12px_rgba(14,165,233,0.28)] ring-1 ring-sky-200/80"
                      : "border-slate-200/70 bg-gradient-to-b from-white to-slate-50/40 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.04)] hover:border-sky-300 hover:shadow-[0_16px_32px_-12px_rgba(14,165,233,0.18)]",
                  )}
                >
                  <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.06)_0%,transparent_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

                  {activeTab === cat.name && (
                    <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-sky-200/30 blur-lg pointer-events-none" />
                  )}

                  <div className="w-full">
                    <p
                      className={cn(
                        "line-clamp-1 text-xs sm:text-sm font-bold tracking-tight transition-colors duration-300",
                        activeTab === cat.name ? "text-sky-800" : "text-slate-700 group-hover:text-sky-600",
                      )}
                    >
                      {cat.name}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "h-[2px] rounded-full transition-all duration-300 my-2",
                      activeTab === cat.name ? "w-10 bg-sky-400" : "w-5 bg-slate-200 group-hover:w-10 group-hover:bg-sky-400",
                    )}
                  />

                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 border",
                      activeTab === cat.name
                        ? "bg-sky-500 text-white border-sky-400"
                        : "bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-sky-50/70 group-hover:text-sky-600 group-hover:border-sky-100/50",
                    )}
                  >
                    {cat.itemCount} sản phẩm
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
