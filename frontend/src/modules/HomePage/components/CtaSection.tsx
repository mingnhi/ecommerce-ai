"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CtaSection() {
  return (
    <section
      
      className="relative rounded-lg"
    >
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <Image src="/images/bg-slide.png" alt="" fill sizes="100vw" className="object-cover" aria-hidden />
        <div aria-hidden className="absolute inset-0 " />
      </div>
      <div className="relative grid items-center gap-4 px-4 py-5 sm:px-8 sm:py-6 md:grid-cols-2 md:gap-8 md:py-7">
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Công nghệ chính hãng — đặt online, nhận hàng trong ngày
          </h2>
          <p className="max-w-lg text-slate-600">
            Tìm nhanh smartphone, laptop và phụ kiện — giá minh bạch, ưu đãi rõ ràng, bảo hành toàn quốc.
          </p>
          <form
            className="flex w-full max-w-md flex-col gap-2 rounded-2xl border border-white/90 bg-white/95 p-1.5 shadow-[0_10px_40px_-12px_rgba(14,165,233,0.3)] ring-1 ring-sky-100/90 backdrop-blur-sm sm:flex-row sm:rounded-full"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Tìm sản phẩm bạn cần..."
                className="h-11 w-full border-0 bg-transparent pl-11 pr-4 text-slate-800 shadow-none placeholder:text-slate-400 focus-visible:ring-0 sm:h-12"
              />
            </div>
            <Button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-sky-500 px-6 font-semibold shadow-md shadow-sky-500/25 hover:bg-sky-600 sm:h-12 sm:rounded-full"
            >
              Tìm kiếm
            </Button>
          </form>
        </div>
        <div className="relative flex h-[120px] w-full items-center justify-center overflow-visible sm:h-[140px] md:mx-auto md:h-[156px] md:max-w-md">
          <div className="relative h-full w-full max-w-[300px] origin-center scale-[1.45] sm:max-w-[340px] sm:scale-[1.55] md:scale-[1.65]">
            <div className="absolute left-1/2 top-0 z-30 w-[60%] -translate-x-1/2">
              <div className="relative aspect-[5/4] w-full">
                <Image
                  src="/images/laptop.png"
                  alt="Laptop"
                  fill
                  sizes="(max-width: 768px) 70vw, 360px"
                  className="object-contain drop-shadow-[0_20px_40px_rgba(14,165,233,0.25)]"
                />
              </div>
            </div>
            <div className="absolute bottom-0 right-[-4%] z-20 w-[45%]">
              <div className="relative aspect-square w-full">
                <Image
                  src="/images/phone.png"
                  alt="Smartphone"
                  fill
                  sizes="(max-width: 768px) 48vw, 220px"
                  className="object-contain drop-shadow-[0_16px_32px_rgba(15,23,42,0.2)]"
                />
              </div>
            </div>
            <div className="absolute bottom-[6%] left-[-4%] z-30 w-[45%]">
              <div className="relative aspect-square w-full">
                <Image
                  src="/images/earphone.png"
                  alt="Tai nghe"
                  fill
                  sizes="(max-width: 768px) 44vw, 200px"
                  className="object-contain drop-shadow-[0_14px_28px_rgba(15,23,42,0.18)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
