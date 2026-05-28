"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ColorBends from "@/components/ui/ColorBends";
import { HERO_COLOR_BENDS, HERO_SLIDES } from "../lib";
import { cn } from "@/lib/utils";

const SLIDE_COUNT = HERO_SLIDES.length;

export function SlideSection() {
  const [heroIndex, setHeroIndex] = useState(0);
  const slide = HERO_SLIDES[heroIndex] ?? HERO_SLIDES[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % SLIDE_COUNT);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative isolate mb-3 min-h-[420px] overflow-hidden rounded-2xl border border-sky-200 bg-sky-50 ring-1 ring-sky-100 sm:min-h-[460px] md:min-h-[480px] lg:min-h-[400px]">
      <div className="absolute inset-0 bg-sky-100/50">
        <ColorBends className="h-full w-full" {...HERO_COLOR_BENDS} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/90 via-white/80 to-sky-100/40 lg:bg-gradient-to-r lg:from-sky-50/90 lg:via-white/75 lg:to-sky-100/40" />

      <div className="relative z-10 grid items-center gap-6 pb-12 pt-6 sm:pb-14 sm:pt-8 lg:grid-cols-2 lg:py-0 lg:min-h-[400px]">
        <div className="flex flex-col justify-center gap-4 px-5 sm:px-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl space-y-3"
            >
              <span className="inline-flex w-fit items-center rounded-full border border-sky-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-700 shadow-sm">
                {slide.badge}
              </span>
              <h1 className="text-2xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-[1.85rem] lg:text-[2.35rem]">
                {slide.title}
              </h1>
              <p className="text-sm font-medium leading-snug text-sky-800/90 md:text-[15px]">{slide.subtitle}</p>
              <p className="max-w-lg text-sm leading-relaxed text-slate-600 md:text-[15px]">{slide.description}</p>
            </motion.div>
          </AnimatePresence>

          <form
            className="flex w-full max-w-md flex-col gap-2 rounded-2xl border border-white/90 bg-white/95 p-1.5 shadow-[0_10px_40px_-12px_rgba(14,165,233,0.35)] ring-1 ring-sky-100/90 backdrop-blur-md sm:flex-row sm:rounded-full"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Tìm iPhone, laptop, tai nghe..."
                className="h-11 w-full border-0 bg-transparent pl-11 pr-4 text-slate-800 shadow-none placeholder:text-slate-400 focus-visible:ring-0 sm:h-12"
              />
            </div>
            <Button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-sky-500 px-6 font-semibold shadow-md shadow-sky-500/30 hover:bg-sky-600 sm:h-12 sm:rounded-full"
            >
              Tìm kiếm
            </Button>
          </form>
        </div>

        <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden px-4 pb-5 lg:min-h-[400px] lg:px-6 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
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

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 lg:hidden">
        {Array.from({ length: SLIDE_COUNT }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setHeroIndex(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              heroIndex === idx
                ? "w-5 bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)]"
                : "w-1.5 bg-sky-300/60 hover:bg-sky-400"
            )}
          />
        ))}
      </div>
    </section>
  );
}