'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Compass, Home, MapPinOff, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

type ErrorVariant = '404' | '403';

type ErrorPageShellProps = {
  variant: ErrorVariant;
  title: string;
  description: string;
  hint: string;
  icon: React.ReactNode;
};

function ErrorPageShell({ variant, title, description, hint, icon }: ErrorPageShellProps) {
  const router = useRouter();

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,165,233,0.18),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(56,189,248,0.12),transparent_50%),linear-gradient(to_bottom_right,#f0f9ff,#ffffff_45%,#e0f2fe)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,165,233,0.12),transparent_55%),linear-gradient(to_bottom_right,#0c4a6e,#0f172a_50%,#082f49)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full border border-sky-200/40 bg-sky-100/20 blur-3xl dark:border-sky-800/30 dark:bg-sky-950/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-96 w-96 rounded-full border border-sky-300/30 bg-sky-50/40 blur-3xl dark:border-sky-700/20 dark:bg-sky-900/20"
      />

      <div className="relative grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div className="relative hidden select-none lg:block">
         
          <p
            className={cn(
              'font-light leading-[0.85] tracking-tight text-transparent bg-clip-text',
              'bg-gradient-to-br from-sky-200 via-sky-400 to-sky-600',
              'text-[10rem] xl:text-[12rem]',
            )}
          >
            {variant}
          </p>
          <div className="mt-8 h-px w-24 bg-gradient-to-r from-sky-400/80 to-transparent" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        </div>

        <div className="relative rounded-[2rem] border border-white/60 bg-white/75 p-8 shadow-[0_32px_64px_-24px_rgba(14,165,233,0.25)] backdrop-blur-xl sm:p-10 dark:border-sky-900/50 dark:bg-slate-900/70 dark:shadow-sky-950/40">
          <div
            aria-hidden
            className="absolute -right-px -top-px h-24 w-24 rounded-tr-[2rem] border-r border-t border-sky-200/60 dark:border-sky-700/40"
          />
          <div
            aria-hidden
            className="absolute -bottom-px -left-px h-20 w-20 rounded-bl-[2rem] border-b border-l border-sky-200/60 dark:border-sky-700/40"
          />

          <div className="flex items-center gap-3 lg:hidden">
            <span className="text-5xl font-light tracking-tight text-sky-500 dark:text-sky-400">{variant}</span>
            <div className="h-10 w-px bg-sky-200 dark:bg-sky-800" />
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-sky-600 dark:text-sky-400">
              Commerce AI
            </span>
          </div>

          <div className="mb-6 inline-flex items-center justify-center rounded-2xl border border-sky-100 bg-sky-50/80 p-3.5 text-sky-600 shadow-sm dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-400">
            {icon}
          </div>

          <h1 className="font-serif text-3xl tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-11 rounded-full border-sky-200/80 bg-white/80 px-6 text-slate-700 hover:bg-sky-50 hover:cursor-pointer dark:border-sky-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-sky-950/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Button
              asChild
              className="h-11 rounded-full bg-sky-500 px-6 text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              <Link href={ROUTES.HOME}>
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>
          </div>

          <div className="mt-10 border-t border-sky-100 pt-6 dark:border-sky-900/80">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Gợi ý
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Compass className="h-4 w-4 shrink-0 text-sky-500" />
                Kiểm tra lại đường dẫn hoặc thử tìm từ menu chính
              </li>
              <li className="flex items-center gap-2">
                <Home className="h-4 w-4 shrink-0 text-sky-500" />
                Quay về trang chủ để tiếp tục mua sắm
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Page404() {
  return (
    <ErrorPageShell
      variant="404"
      title="Trang không tìm thấy"
      description="Có vẻ như liên kết đã thay đổi hoặc trang này không còn tồn tại. Hãy để chúng tôi đưa bạn trở lại hành trình mua sắm."
      hint="Đường dẫn không khớp — hãy thử quay lại hoặc khám phá từ trang chủ."
      icon={<MapPinOff className="h-7 w-7" strokeWidth={1.5} />}
    />
  );
}

export function Page403() {
  return (
    <ErrorPageShell
      variant="403"
      title="Khu vực hạn chế"
      description="Tài khoản của bạn chưa có quyền truy cập nội dung này. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng đăng nhập bằng tài khoản phù hợp."
      hint="Quyền truy cập bị giới hạn — chỉ những người được phép mới vào được khu vực này."
      icon={<ShieldOff  className="h-7 w-7" strokeWidth={1.5} />}
    />
  );
}
