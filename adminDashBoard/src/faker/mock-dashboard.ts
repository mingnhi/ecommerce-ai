export type SalesDayPoint = { label: string; value: number }

export type SummaryMetric = {
  title: string
  subtitle: string
  valueVnd: number | null
  valuePlain: string | null
  trendUp: boolean
  trendPercent: number
  kind: "revenue" | "orders" | "customers" | "pending"
}

export const summaryMetrics: SummaryMetric[] = [
  {
    title: "Tổng doanh thu",
    subtitle: "30 ngày qua",
    valueVnd: 82_650_000,
    valuePlain: null,
    trendUp: true,
    trendPercent: 11,
    kind: "revenue",
  },
  {
    title: "Đơn hàng",
    subtitle: "Đã thanh toán",
    valueVnd: null,
    valuePlain: "3.847",
    trendUp: true,
    trendPercent: 6,
    kind: "orders",
  },
  {
    title: "Khách hàng",
    subtitle: "Có giao dịch",
    valueVnd: null,
    valuePlain: "1.256",
    trendUp: true,
    trendPercent: 4,
    kind: "customers",
  },
  {
    title: "Chờ xử lý",
    subtitle: "Đơn & hoàn tiền",
    valueVnd: null,
    valuePlain: "42",
    trendUp: false,
    trendPercent: 17,
    kind: "pending",
  },
]

export const salesAnalytic7d: SalesDayPoint[] = [
  { label: "22 Th7", value: 41_200_000 },
  { label: "23 Th7", value: 56_800_000 },
  { label: "24 Th7", value: 52_100_000 },
  { label: "25 Th7", value: 61_400_000 },
  { label: "26 Th7", value: 58_900_000 },
  { label: "27 Th7", value: 67_200_000 },
  { label: "28 Th7", value: 72_500_000 },
]

export const salesAnalytic30d: SalesDayPoint[] = [
  { label: "01 Th7", value: 38_000_000 },
  { label: "05 Th7", value: 45_200_000 },
  { label: "10 Th7", value: 51_800_000 },
  { label: "15 Th7", value: 48_300_000 },
  { label: "20 Th7", value: 62_100_000 },
  { label: "25 Th7", value: 59_400_000 },
  { label: "28 Th7", value: 72_500_000 },
]

export type AnalyticMiniStat = {
  label: string
  amountVnd: number
  deltaPercent: number
  variant: "income" | "expense" | "balance"
}

export const analyticMiniStats: AnalyticMiniStat[] = [
  {
    label: "Thu nhập",
    amountVnd: 428_600_000,
    deltaPercent: 5.2,
    variant: "income",
  },
  {
    label: "Chi phí",
    amountVnd: 156_200_000,
    deltaPercent: 2.4,
    variant: "expense",
  },
  {
    label: "Số dư",
    amountVnd: 272_400_000,
    deltaPercent: 8.1,
    variant: "balance",
  },
]

export type SalesTargetSnapshot = {
  dayPercent: number
  monthPercent: number
  centerPercent: number
  dayTrendUp: boolean
  monthTrendUp: boolean
}

export const salesTargetSnapshot: SalesTargetSnapshot = {
  dayPercent: 72,
  monthPercent: 58,
  centerPercent: 68,
  dayTrendUp: true,
  monthTrendUp: true,
}

export type SalesTargetPieRow = {
  key: string
  value: number
  fill: string
}

export const salesTargetPieChartData: SalesTargetPieRow[] = [
  { key: "online", value: 275_000_000, fill: "var(--color-online)" },
  { key: "retail", value: 200_000_000, fill: "var(--color-retail)" },
  { key: "marketplace", value: 287_000_000, fill: "var(--color-marketplace)" },
  { key: "b2b", value: 173_000_000, fill: "var(--color-b2b)" },
  { key: "other", value: 190_000_000, fill: "var(--color-other)" },
]

export type CurrentOffer = {
  id: string
  title: string
  expiryLabel: string
  progress: number
}

export const currentOffers: CurrentOffer[] = [
  {
    id: "1",
    title: "Giảm 40% nhóm thời trang",
    expiryLabel: "Hết hạn: 05-08-2026",
    progress: 72,
  },
  {
    id: "2",
    title: "Freeship toàn quốc đơn từ 299k",
    expiryLabel: "Hết hạn: 12-08-2026",
    progress: 45,
  },
  {
    id: "3",
    title: "Tặng voucher 50k cho thành viên mới",
    expiryLabel: "Hết hạn: 31-08-2026",
    progress: 88,
  },
]
