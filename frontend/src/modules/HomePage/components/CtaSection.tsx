"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterEmailSchema } from "@/lib/validations/newsletter";

export function CtaSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = newsletterEmailSchema.safeParse({ email });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Email không hợp lệ");
      return;
    }

    // TODO: Gọi API đăng ký newsletter sau
    setEmail("");
    toast.success("Đã đăng ký nhận tin!", {
      description: `Chúng tôi sẽ gửi ưu đãi tới ${parsed.data.email}`,
    });
  };

  return (
    <section className="relative rounded-lg overflow-hidden">
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <Image src="/images/bg-slide.png" alt="" fill sizes="100vw" className="object-cover" aria-hidden />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative flex flex-col items-center gap-6 px-4 py-6 sm:px-8 sm:py-8 xl:flex-row md:gap-8 md:py-12">
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Đặt online, nhận hàng trong ngày!
          </h2>
          <p className="max-w-lg text-xs sm:text-sm text-slate-600">
            Đăng ký email để nhận ưu đãi, tin khuyến mãi và gợi ý sản phẩm phù hợp với bạn.
          </p>

          <form
            className="flex w-full max-w-md flex-col gap-2 rounded-2xl border border-white/90 bg-white/95 p-1.5 shadow-[0_10px_40px_-12px_rgba(14,165,233,0.3)] ring-1 ring-sky-100/90 backdrop-blur-sm sm:flex-row sm:rounded-full"
            onSubmit={handleSubmit}
          >
            <div className="relative min-w-0 flex-1">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full border-0 bg-transparent pl-11 pr-4 text-slate-800 shadow-none placeholder:text-slate-400 focus-visible:ring-0 sm:h-12"
              />
            </div>
            <Button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-sky-500 px-6 font-semibold shadow-md shadow-sky-500/25 hover:bg-sky-600 sm:h-12 sm:rounded-full"
            >
              Đăng ký
            </Button>
          </form>
        </div>

        {/* Decorative images */}
        <div className="relative flex h-[100px] w-full items-center justify-center overflow-visible sm:h-[130px] md:mx-auto md:h-[156px] md:max-w-md mt-4 xl:mt-0">
          <div className="relative h-full w-full max-w-[200px] xs:max-w-[280px] origin-center scale-[1.15] xs:scale-[1.35] sm:max-w-[340px] sm:scale-[1.55] md:scale-[1.65]">
            {/* Giữ nguyên 3 hình laptop, phone, earphone như cũ */}
            {/* ... (code phần image giữ nguyên) */}
          </div>
        </div>
      </div>
    </section>
  );
}