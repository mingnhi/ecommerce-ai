import * as React from "react";

import { Link } from "react-router-dom";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CoinsIcon,
  FolderTreeIcon,
  PackageIcon,
  ShoppingCartIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { MOCK_TOP_SELLING } from "@/faker/mock-products";

import {
  currentOffers,
  salesAnalytic30d,
  salesAnalytic7d,
  salesTargetPieChartData,
  salesTargetSnapshot,
  summaryMetrics,
  type SummaryMetric,
} from "@/faker/mock-dashboard";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";

import { Progress } from "@/shared/components/ui/progress";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import {
  formatVnd,
  formatVndAxis,
  formatVndBillion,
} from "@/shared/lib/format-vnd";

import { cn } from "@/shared/lib/utils";

import {
  useCategories,
} from "@/features/products/hooks/categories";

const areaConfig = {
  value: {
    label: "Doanh thu",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const targetPieConfig = {
  value: { label: "Doanh thu" },

  online: {
    label: "Kênh online",
    color: "var(--chart-1)",
  },

  retail: {
    label: "Cửa hàng",
    color: "var(--chart-2)",
  },

  marketplace: {
    label: "Marketplace",
    color: "var(--chart-3)",
  },

  b2b: {
    label: "B2B / đại lý",
    color: "var(--chart-4)",
  },

  other: {
    label: "Khác",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

function MetricIcon({
  kind,
}: {
  kind: SummaryMetric["kind"];
}) {
  const c =
    "flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-500";

  if (kind === "revenue") {
    return (
      <div className={c}>
        <CoinsIcon className="size-5" />
      </div>
    );
  }

  if (kind === "orders") {
    return (
      <div className={c}>
        <ShoppingCartIcon className="size-5" />
      </div>
    );
  }

  if (kind === "customers") {
    return (
      <div className={c}>
        <UsersIcon className="size-5" />
      </div>
    );
  }

  return (
    <div className={c}>
      <PackageIcon className="size-5" />
    </div>
  );
}

const carouselArrowClass =
  "static top-auto right-auto bottom-auto left-auto flex size-8 translate-x-0 translate-y-0 rounded-lg border-border/80";

const DashboardPage = () => {
  const [range, setRange] =
    React.useState<"7d" | "30d">(
      "7d"
    );

  /**
   * categories
   */
  const {
    data: categoriesData,
  } = useCategories(
    "flat"
  );

  const categoryCount =
    categoriesData
      ?.categories?.length || 0;

  /**
   * chart data
   */
  const chartData =
    range === "7d"
      ? salesAnalytic7d
      : salesAnalytic30d;

  const t =
    salesTargetSnapshot;

  const pieTotal =
    React.useMemo(
      () =>
        salesTargetPieChartData.reduce(
          (
            acc,
            row
          ) =>
            acc + row.value,
          0
        ),
      []
    );

  return (
    <div className="mx-auto w-full space-y-8 pb-2">
      <header className="relative border-b border-border/50 pb-4">
        <div className="absolute left-0 top-1.5 h-1 w-12 rounded-full bg-sky-500" />

        <p className="pt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-sky-500">
          ecommerce-ai · quản trị
        </p>

        <h1 className="mt-4 max-w-xl text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground md:text-[1.875rem]">
          Chào mừng bạn đến hệ thống
        </h1>

        <p className="mt-3 max-w-2xl text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground">
          Dashboard quản lý hệ thống ecommerce.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Link to="/categories">
          <Card className="group relative overflow-hidden rounded-sm border-0 bg-card pt-2 shadow-sm ring-1 ring-black/4 transition-all hover:-translate-y-1 hover:ring-sky-500/30 dark:ring-white/6">
            <div className="absolute right-4 top-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-sky-500/15 text-sky-500">
                <FolderTreeIcon className="size-5" />
              </div>
            </div>

            <CardHeader className="pb-2 pr-16 pt-5">
              <CardTitle className="text-sm font-semibold leading-none">
                Categories
              </CardTitle>

              <CardDescription className="mt-1.5 text-xs">
                Quản lý danh mục
              </CardDescription>
            </CardHeader>

            <CardContent className="flex items-center justify-between">
              <p className="text-2xl font-bold tracking-tight">
                {
                  categoryCount
                }
              </p>

              <div className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-2 py-1 text-xs font-semibold text-sky-500">
                Manage
              </div>
            </CardContent>
          </Card>
        </Link>

        {summaryMetrics.map(
          m => (
            <Card
              key={
                m.title
              }
              className="relative overflow-hidden rounded-sm border-0 bg-card pt-2 shadow-sm ring-1 ring-black/4 dark:ring-white/6"
            >
              <div className="absolute right-4 top-4">
                <MetricIcon
                  kind={
                    m.kind
                  }
                />
              </div>

              <CardHeader className="pb-2 pr-16 pt-5">
                <CardTitle className="text-sm font-semibold leading-none">
                  {
                    m.title
                  }
                </CardTitle>

                <CardDescription className="mt-1.5 text-xs">
                  {
                    m.subtitle
                  }
                </CardDescription>
              </CardHeader>

              <CardContent className="flex items-center justify-between">
                <p className="text-2xl font-bold tracking-tight">
                  {m.valueVnd !=
                  null
                    ? formatVnd(
                        m.valueVnd
                      )
                    : m.valuePlain}
                </p>

                <div
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
                    m.trendUp
                      ? "bg-emerald-500/12 text-emerald-600"
                      : "bg-red-500/12 text-red-600"
                  )}
                >
                  {m.trendUp ? (
                    <TrendingUpIcon className="size-3.5" />
                  ) : (
                    <TrendingDownIcon className="size-3.5" />
                  )}

                  {
                    m.trendPercent
                  }
                  %
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="rounded-sm border-0 bg-card shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Phân tích bán hàng
              </CardTitle>

              <CardDescription>
                Biểu đồ doanh thu theo ngày
              </CardDescription>
            </div>

            <Select
              value={range}
              onValueChange={v =>
                setRange(
                  v as
                    | "7d"
                    | "30d"
                )
              }
            >
              <SelectTrigger className="h-9 w-[200px] rounded-lg border-border/80 bg-muted/30 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="7d">
                  7 ngày gần nhất
                </SelectItem>

                <SelectItem value="30d">
                  30 ngày qua
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <ChartContainer
              config={
                areaConfig
              }
              className="aspect-video w-full max-h-[320px]"
            >
              <AreaChart
                data={
                  chartData
                }
                margin={{
                  left: 4,
                  right: 12,
                  top: 8,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="fillRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--color-value)"
                      stopOpacity={
                        0.4
                      }
                    />

                    <stop
                      offset="100%"
                      stopColor="var(--color-value)"
                      stopOpacity={
                        0.03
                      }
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={
                    false
                  }
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="label"
                  tickLine={
                    false
                  }
                  axisLine={
                    false
                  }
                />

                <YAxis
                  tickLine={
                    false
                  }
                  axisLine={
                    false
                  }
                  tickFormatter={
                    formatVndAxis
                  }
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={
                    2.5
                  }
                  fill="url(#fillRevenue)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-0 bg-card shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Mục tiêu bán hàng
            </CardTitle>

            <CardDescription>
              KPI doanh thu
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ChartContainer
              config={
                targetPieConfig
              }
              className="aspect-square max-h-[260px]"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent hideLabel />
                  }
                />

                <Pie
                  data={
                    salesTargetPieChartData
                  }
                  dataKey="value"
                  nameKey="key"
                  innerRadius={
                    62
                  }
                  strokeWidth={
                    4
                  }
                />
              </PieChart>
            </ChartContainer>

            <div className="mt-4 text-center">
              <p className="text-2xl font-bold">
                {formatVndBillion(
                  pieTotal
                )}
              </p>

              <p className="text-xs text-muted-foreground">
                Tổng mục tiêu
              </p>
            </div>

            <div className="mt-6 border-t pt-4 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <TrendingUpIcon className="size-4 text-sky-500" />
                Tổng tiến độ{" "}
                {
                  t.centerPercent
                }
                %
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="rounded-sm border-0 bg-card shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <Carousel
            opts={{
              align:
                "start",

              loop: false,
            }}
            className="w-full"
          >
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">
                  Sản phẩm bán chạy
                </CardTitle>

                <CardDescription>
                  Theo số lượng đã bán
                </CardDescription>
              </div>

              <div className="flex gap-1">
                <CarouselPrevious
                  className={
                    carouselArrowClass
                  }
                />

                <CarouselNext
                  className={
                    carouselArrowClass
                  }
                />
              </div>
            </CardHeader>

            <CardContent>
              <CarouselContent className="-ml-2">
                {MOCK_TOP_SELLING.map(
                  p => (
                    <CarouselItem
                      key={
                        p.productId
                      }
                      className="basis-full pl-2 sm:basis-1/2 lg:basis-1/3"
                    >
                      <article className="pr-2">
                        <div className="aspect-square overflow-hidden rounded-sm">
                          <img
                            src={
                              p.image
                            }
                            alt={
                              p.name
                            }
                            className="size-full object-cover"
                          />
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-sm font-semibold">
                          {
                            p.name
                          }
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {p.soldCount.toLocaleString(
                            "vi-VN"
                          )}{" "}
                          đã bán
                        </p>
                      </article>
                    </CarouselItem>
                  )
                )}
              </CarouselContent>
            </CardContent>
          </Carousel>
        </Card>

        <Card className="rounded-sm border-0 bg-card shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-semibold">
              Ưu đãi hiện tại
            </CardTitle>

            <CardDescription>
              Chương trình đang chạy
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {currentOffers.map(
              o => (
                <div
                  key={o.id}
                  className="space-y-2"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {
                        o.title
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {
                        o.expiryLabel
                      }
                    </p>
                  </div>

                  <Progress
                    value={
                      o.progress
                    }
                    className="h-2"
                  />
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;