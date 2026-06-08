'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  History,
  Home,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/clipboard';
import { formatVnd } from '@/lib/format-currency';
import { ROUTES } from '@/lib/routes';
import type { PaymentDisplay } from '@/lib/payment-result';
import { cn } from '@/lib/utils';

type Variant = 'success' | 'failed';

type PaymentResultViewProps = {
  variant: Variant;
  orderId: string;
  display: PaymentDisplay;
  title?: string;
  description: string;
  showVnpayDetails?: boolean;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

const FIREWORK_COLORS = [
  '#0ea5e9',
  '#38bdf8',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#a855f7',
  '#14b8a6',
  '#facc15',
];
const FIREWORK_MS = 4500;

function burst(x: number, y: number): Spark[] {
  const count = 48 + Math.floor(Math.random() * 24);
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 45 + Math.random() * 30,
      color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
      size: 1.5 + Math.random() * 2.5,
    };
  });
}

function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    let sparks: Spark[] = [];
    const timeouts: number[] = [];
    const startedAt = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const launch = (rx: number, ry: number, delay: number) => {
      timeouts.push(
        window.setTimeout(() => {
          if (performance.now() - startedAt >= FIREWORK_MS) return;
          sparks.push(...burst(canvas.width * rx, canvas.height * ry));
        }, delay),
      );
    };

    const points: [number, number][] = [
      [0.2, 0.25],
      [0.5, 0.18],
      [0.8, 0.22],
      [0.35, 0.35],
      [0.65, 0.32],
      [0.15, 0.4],
      [0.85, 0.38],
      [0.5, 0.28],
    ];
    points.forEach(([rx, ry], i) => launch(rx, ry, i * 400));

    const draw = () => {
      const elapsed = performance.now() - startedAt;
      if (elapsed >= FIREWORK_MS) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparks = sparks.filter((s) => {
        s.life += 1;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05;
        s.vx *= 0.98;
        const t = 1 - s.life / s.maxLife;
        if (t <= 0) return false;
        ctx.globalAlpha = t;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * t, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
      if (sparks.length > 0 || elapsed < FIREWORK_MS) {
        frameId = requestAnimationFrame(draw);
      }
    };

    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      timeouts.forEach(clearTimeout);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20"
      aria-hidden
    />
  );
}

function OrderIdRow({ orderId }: { orderId: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3.5">
      <dt className="shrink-0 pt-0.5 text-sm text-slate-500">Mã đơn hàng</dt>
      <dd className="flex min-w-0 items-start justify-end gap-2">
        <span className="break-all text-right font-mono text-xs font-medium leading-snug text-slate-900 sm:text-sm">
          {orderId}
        </span>
        <button
          type="button"
          onClick={() => copyToClipboard(orderId, 'Đã sao chép mã đơn hàng')}
          className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-600 cursor-pointer"
          aria-label="Sao chép mã đơn hàng"
        >
          <Copy className="size-4" />
        </button>
      </dd>
    </div>
  );
}

function Details({
  orderId,
  display,
  showVnpayDetails = true,
}: {
  orderId: string;
  display: PaymentDisplay;
  showVnpayDetails?: boolean;
}) {
  const amountValue =
    display.amount > 0 ? formatVnd(display.amount) : '—';

  const rows = showVnpayDetails
    ? [
        { label: 'Số tiền', value: amountValue },
        { label: 'Ngân hàng', value: display.bankCode ?? '—' },
        {
          label: 'Mã giao dịch',
          value: display.transactionNo ?? display.txnRef ?? '—',
        },
      ]
    : [{ label: 'Số tiền thanh toán', value: amountValue }];

  return (
    <dl className="divide-y divide-slate-200/80 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/30">
      <OrderIdRow orderId={orderId} />
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-6 px-5 py-3.5"
        >
          <dt className="text-sm text-slate-500">{row.label}</dt>
          <dd className="text-right text-sm font-medium text-slate-900" title={row.value}>
            {row.value}
          </dd>
        </div>
      ))}
      {showVnpayDetails && display.responseCode ? (
        <div className="flex items-start justify-between gap-6 bg-amber-50/50 px-5 py-3.5">
          <dt className="text-sm text-amber-800/70">Mã VNPAY</dt>
          <dd className="font-mono text-sm font-medium text-amber-900">
            {display.responseCode}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

function ResultCard({
  variant,
  badge,
  title,
  description,
  icon,
  children,
}: {
  variant: Variant;
  badge: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const isSuccess = variant === 'success';

  return (
    <div className="flex min-h-[calc(100vh-66px)] items-center justify-center bg-slate-50/80 px-4 sm:px-6 py-7">
      <article
        className={cn(
          'w-full max-w-[min(100%,36rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white',
          'shadow-[0_12px_40px_rgba(14,116,144,0.1)] animate-in fade-in slide-in-from-bottom-3 duration-500',
          'sm:max-w-xl',
        )}
      >
        <header
          className={cn(
            'border-b border-slate-100 px-8 text-center sm:px-10',
            isSuccess ? 'bg-sky-50/50' : 'bg-slate-50/70',
          )}
        >
       
          <div
            className={cn(
              'mx-auto mt-6 flex size-16 items-center justify-center rounded-full border-2 bg-white shadow-sm',
              isSuccess
                ? 'border-emerald-200 text-emerald-600'
                : 'border-red-200 text-red-600',
            )}
          >
            {icon}
          </div>
          <h1 className="mt-6 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        </header>

        <div className="space-y-6 px-8 sm:px-10 py-3">{children}</div>

        <p className="border-t border-slate-100 px-8 py-4 text-center text-[11px] text-slate-400 sm:px-10">
          Cần hỗ trợ? Liên hệ bộ phận chăm sóc khách hàng.
        </p>
      </article>
    </div>
  );
}

export function PaymentResultView({
  variant,
  orderId,
  display,
  title,
  description,
  showVnpayDetails = true,
}: PaymentResultViewProps) {
  const isSuccess = variant === 'success';
  const headline =
    title ?? (isSuccess ? 'Thanh toán thành công' : 'Giao dịch chưa hoàn tất');
  const badge = isSuccess ? 'Hoàn tất' : 'Thanh toán thất bại';

  return (
    <>
      {isSuccess ? <Fireworks /> : null}
      <ResultCard
        variant={variant}
        badge={badge}
        title={headline}
        description={description}
        icon={
          isSuccess ? (
            <Check className="size-7" strokeWidth={2.5} />
          ) : (
            <AlertCircle className="size-7" strokeWidth={1.75} />
          )
        }
      >
        <Details
          orderId={orderId}
          display={display}
          showVnpayDetails={showVnpayDetails}
        />

        <div className="space-y-3">
          {isSuccess ? (
            <Button
              asChild
              className="h-11 w-full rounded-lg bg-sky-500 text-sm font-medium text-white hover:bg-sky-600"
            >
              <Link href={ROUTES.ORDER_HISTORY}>
                <History className="mr-2 size-4" />
                Xem đơn hàng
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="h-11 w-full rounded-lg bg-sky-500 text-sm font-medium text-white hover:bg-sky-600"
            >
              <Link href={ROUTES.CHECKOUT}>
                <RotateCcw className="mr-2 size-4" />
                Thử thanh toán lại
              </Link>
            </Button>
          )}

          <div className="flex items-center justify-center gap-8 pt-1">
            {!isSuccess ? (
              <Link
                href={ROUTES.ORDER_HISTORY}
                className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-sky-700"
              >
                <History className="size-3.5" />
                Đơn hàng
              </Link>
            ) : null}
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-sky-700"
            >
              <Home className="size-3.5" />
              Trang chủ
            </Link>
            {isSuccess ? (
              <Link
                href={ROUTES.HOME}
                className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-sky-700"
              >
                <ShoppingBag className="size-3.5" />
                Mua sắm
              </Link>
            ) : null}
          </div>
        </div>

        {!isSuccess ? (
          <p className="text-center text-xs leading-relaxed text-slate-400">
            Đơn vẫn chờ thanh toán. Bạn có thể chọn COD hoặc VNPAY khi thử lại.
          </p>
        ) : null}
      </ResultCard>
    </>
  );
}
