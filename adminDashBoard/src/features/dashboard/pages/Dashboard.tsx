import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CoinsIcon,
  PackageIcon,
  ShoppingCartIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"
import { MOCK_TOP_SELLING } from "@/faker/mock-products"
import {
  analyticMiniStats,
  currentOffers,
  salesAnalytic30d,
  salesAnalytic7d,
  salesTargetPieChartData,
  salesTargetSnapshot,
  summaryMetrics,
  type SummaryMetric,
} from "@/faker/mock-dashboard"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/shared/components/ui/chart"
import { Progress } from "@/shared/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { formatVnd, formatVndAxis, formatVndBillion } from "@/shared/lib/format-vnd"
import { cn } from "@/shared/lib/utils"

const areaConfig = {
  value: { label: "Doanh thu", color: "var(--chart-1)" },
} satisfies ChartConfig

const targetPieConfig = {
  value: { label: "Doanh thu" },
  online: { label: "Kênh online", color: "var(--chart-1)" },
  retail: { label: "Cửa hàng", color: "var(--chart-2)" },
  marketplace: { label: "Marketplace", color: "var(--chart-3)" },
  b2b: { label: "B2B / đại lý", color: "var(--chart-4)" },
  other: { label: "Khác", color: "var(--chart-5)" },
} satisfies ChartConfig

function MetricIcon({ kind }: { kind: SummaryMetric["kind"] }) {
  const c =
    "flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary"
  if (kind === "revenue")
    return (
      <div className={c}>
        <CoinsIcon className="size-5" />
      </div>
    )
  if (kind === "orders")
    return (
      <div className={c}>
        <ShoppingCartIcon className="size-5" />
      </div>
    )
  if (kind === "customers")
    return (
      <div className={c}>
        <UsersIcon className="size-5" />
      </div>
    )
  return (
    <div className={c}>
      <PackageIcon className="size-5" />
    </div>
  )
}

const carouselArrowClass =
  "static top-auto right-auto bottom-auto left-auto flex size-8 translate-x-0 translate-y-0 rounded-lg border-border/80"

const DashboardPage = () => {
  const [range, setRange] = React.useState<"7d" | "30d">("7d")
  const chartData = range === "7d" ? salesAnalytic7d : salesAnalytic30d
  const t = salesTargetSnapshot
  const pieTotal = React.useMemo(
    () => salesTargetPieChartData.reduce((acc, row) => acc + row.value, 0),
    [],
  )

  return (
    <div className="mx-auto w-full w-full space-y-8 pb-2">
      <header className="relative border-b border-border/50 pb-4">
        <div className="absolute left-0 top-1.5 h-1 w-12 rounded-full bg-primary shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent)]" />
        <p className="pt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-primary">
          ecommerce-ai · quản trị
        </p>
        <h1 className="mt-4 max-w-xl text-balance font-semibold tracking-tight text-foreground text-[1.625rem] leading-tight md:text-[1.875rem]">
          Chào mừng bạn đến hệ thống
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground">
          Bảng điều khiển tập trung vào dữ liệu bán hàng thực tế — theo dõi doanh thu, mục
          tiêu và chiến dịch trong một không gian gọn, rõ ràng để đội vận hành ra quyết định
          nhanh và nhất quán.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map((m) => (
          <Card
            key={m.title}
            className="relative overflow-hidden rounded-sm border-0 bg-card pt-2 shadow-sm ring-1 ring-black/4 dark:ring-white/6"
          >
            <div className="absolute right-4 top-4">
              <MetricIcon kind={m.kind} />
            </div>
            <CardHeader className="pb-2 pr-16 pt-5">
              <CardTitle className="text-sm font-semibold leading-none text-foreground">
                {m.title}
              </CardTitle>
              <CardDescription className="mt-1.5 text-xs text-muted-foreground">
                {m.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-between">
              <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {m.valueVnd != null ? formatVnd(m.valueVnd) : m.valuePlain}
              </p>
              <div className="flex justify-end">
                <div
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold tabular-nums",
                    m.trendUp
                      ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/12 text-red-600 dark:text-red-400",
                  )}
                >
                  {m.trendUp ? (
                    <TrendingUpIcon className="size-3.5" />
                  ) : (
                    <TrendingDownIcon className="size-3.5" />
                  )}
                  {m.trendPercent}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="rounded-sm border-0 bg-card shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <CardHeader className="flex flex-col gap-4 space-y-0 border-b border-border/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Phân tích bán hàng
              </CardTitle>
              <CardDescription>Biểu đồ doanh thu theo ngày</CardDescription>
            </div>
            <div className="flex flex-col gap-1 sm:items-end">
              <span className="text-[11px] font-medium text-muted-foreground">
                Sắp xếp theo
              </span>
              <Select value={range} onValueChange={(v) => setRange(v as "7d" | "30d")}>
                <SelectTrigger className="h-9 w-full rounded-lg border-border/80 bg-muted/30 text-left text-xs font-medium sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 ngày gần nhất</SelectItem>
                  <SelectItem value="30d">30 ngày qua</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {analyticMiniStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-sm border border-border/60 bg-muted/20 px-4 py-3"
                >
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
                    {formatVnd(s.amountVnd)}
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                      s.variant === "income" && "bg-primary/15 text-primary",
                      s.variant === "expense" &&
                        "bg-orange-500/15 text-orange-600 dark:text-orange-400",
                      s.variant === "balance" &&
                        "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {s.deltaPercent >= 0 ? "+" : ""}
                    {s.deltaPercent}%
                  </span>
                </div>
              ))}
            </div>
            <ChartContainer config={areaConfig} className="aspect-video w-full max-h-[320px]">
              <AreaChart
                data={chartData}
                accessibilityLayer
                margin={{ left: 4, right: 12, top: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/50" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={44}
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  tickFormatter={formatVndAxis}
                />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="rounded-lg border border-border/60 bg-popover px-2.5 py-2 text-xs shadow-lg">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="mt-0.5 font-mono font-medium tabular-nums text-primary">
                          {formatVnd(Number(payload[0].value))}
                        </p>
                      </div>
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2.5}
                  fill="url(#fillRevenue)"
                  activeDot={{ r: 5, className: "fill-primary stroke-primary-foreground" }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col rounded-sm border-0 bg-card shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <CardHeader className="pb-2 text-center sm:text-left">
            <CardTitle className="text-lg font-semibold tracking-tight">
              Mục tiêu bán hàng
            </CardTitle>
            <CardDescription>Phân bổ doanh thu theo kênh (KPI tháng)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center pb-2">
            <div className="relative mx-auto w-full max-w-[260px]">
              <ChartContainer
                config={targetPieConfig}
                className="aspect-square w-full max-h-[260px]"
              >
                <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(v) => formatVnd(Number(v))}
                      />
                    }
                  />
                  <Pie
                    data={salesTargetPieChartData}
                    dataKey="value"
                    nameKey="key"
                    innerRadius={62}
                    strokeWidth={4}
                    className="stroke-background"
                  />
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-3 text-center antialiased">
                <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground md:text-[1.75rem]">
                  {formatVndBillion(pieTotal)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                  Tổng mục tiêu
                </p>
              </div>
            </div>
            <ul className="mt-6 w-full max-w-xs space-y-2.5 border-t border-border/60 pt-5 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Mục tiêu ngày</span>
                <span className="flex items-center gap-1.5 font-semibold tabular-nums text-foreground">
                  {t.dayPercent}%
                  {t.dayTrendUp ? (
                    <TrendingUpIcon className="size-4 text-emerald-500" />
                  ) : (
                    <TrendingDownIcon className="size-4 text-red-500" />
                  )}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Mục tiêu tháng</span>
                <span className="flex items-center gap-1.5 font-semibold tabular-nums text-foreground">
                  {t.monthPercent}%
                  {t.monthTrendUp ? (
                    <TrendingUpIcon className="size-4 text-emerald-500" />
                  ) : (
                    <TrendingDownIcon className="size-4 text-red-500" />
                  )}
                </span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-1.5 border-t border-border/60 pt-4 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none text-foreground">
              <TrendingUpIcon className="size-4 shrink-0 text-primary" />
              Tổng tiến độ {t.centerPercent}% so với kế hoạch
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Năm kênh đóng góp vào mục tiêu; đưa chuột vào từng phần để xem giá trị VND.
            </p>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-sm border-0 bg-card shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Sản phẩm bán chạy
                </CardTitle>
                <CardDescription>Theo số lượng đã bán</CardDescription>
              </div>
              <div className="flex shrink-0 gap-1">
                <CarouselPrevious className={carouselArrowClass} aria-label="Trước" />
                <CarouselNext className={carouselArrowClass} aria-label="Sau" />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <CarouselContent className="-ml-2">
                {MOCK_TOP_SELLING.map((p) => (
                  <CarouselItem
                    key={p.productId}
                    className="basis-full pl-2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <article className="pr-2">
                      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-muted/80 ring-1 ring-inset ring-black/4 dark:ring-white/6">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                        {p.soldCount.toLocaleString("vi-VN")} đã bán
                      </p>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </CardContent>
          </Carousel>
        </Card>

        <Card className="h-full rounded-sm border-0 bg-card shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-semibold tracking-tight">Ưu đãi hiện tại</CardTitle>
            <CardDescription>Chương trình đang chạy trên cửa hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {currentOffers.map((o) => (
              <div key={o.id} className="space-y-2">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold leading-snug text-foreground">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{o.expiryLabel}</p>
                </div>
                <Progress value={o.progress} className="h-2 bg-muted" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
