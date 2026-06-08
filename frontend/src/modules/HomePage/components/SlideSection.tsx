"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import ColorBends from "@/components/ui/ColorBends";
import { HERO_COLOR_BENDS, HERO_SLIDES } from "../lib";
import { buildProductPageUrl } from "@/modules/ProductPage/lib";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SLIDE_COUNT = HERO_SLIDES.length;

export function SlideSection() {
  const [heroIndex, setHeroIndex] = useState(0);
  const slide = HERO_SLIDES[heroIndex] ?? HERO_SLIDES[0]!;

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % SLIDE_COUNT), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative isolate mb-3 min-h-[420px] overflow-hidden rounded-2xl border border-sky-200 bg-sky-50 ring-1 ring-sky-100 sm:min-h-[460px] md:min-h-[480px] lg:min-h-[400px]">
      <div className="absolute inset-0 bg-sky-100/50">
        <ColorBends className="h-full w-full" {...HERO_COLOR_BENDS} />
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-sky-50/90 via-white/80 to-sky-100/40 lg:bg-gradient-to-r lg:from-sky-50/90 lg:via-white/75 lg:to-sky-100/40" />
      <div className="relative z-10 grid items-center gap-6 pb-12 pt-6 sm:pb-14 sm:pt-8 lg:grid-cols-2 lg:py-0 lg:min-h-[400px]">
        <div className="flex flex-col justify-center gap-4 px-5 sm:px-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl space-y-3"
            >
              <span className="inline-flex w-fit items-center rounded-full border border-sky-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-700 shadow-sm ring-1 ring-sky-100">
                {slide.badge}
              </span>
              <h1 className="text-2xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-[1.85rem] lg:text-[2.35rem]">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-700 bg-clip-text text-transparent">
                  {slide.title}
                </span>
              </h1>
              <p className="text-sm font-medium leading-snug text-sky-800/90 md:text-[15px]">{slide.subtitle}</p>
              <p className="max-w-lg text-sm leading-relaxed text-slate-600 md:text-[15px]">{slide.description}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Button
              asChild
              className="h-11 rounded-full bg-sky-500 px-6 text-sm font-semibold text-white hover:bg-sky-600"
            >
              <Link href={ROUTES.PRODUCTS}>
                <ShoppingBag className="size-4" />
                Khám phá ngay
              </Link>
            </Button>
            <Link
              href={buildProductPageUrl({ sort: "best_selling" })}
              className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 transition-colors hover:text-sky-700"
            >
              Xem sản phẩm nổi bật
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden px-4 pb-5 lg:min-h-[400px] lg:px-6 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="flex w-full items-center justify-center"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                width={720}
                height={720}
                priority
                className="max-h-[180px] sm:max-h-[240px] md:max-h-[280px] w-auto max-w-full origin-center scale-110 object-contain drop-shadow-xl lg:max-h-[350px] lg:translate-x-16 lg:scale-125"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute block lg:hidden bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
        {Array.from({ length: SLIDE_COUNT }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setHeroIndex(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
              heroIndex === idx
                ? "w-5 bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)]"
                : "w-1.5 bg-sky-300/60 hover:bg-sky-400",
            )}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
