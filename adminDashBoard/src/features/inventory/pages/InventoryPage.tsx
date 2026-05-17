import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  History,
  Layers,
  Lock,
  PackagePlus,
  ShoppingBag,
  Warehouse,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useInventory } from "@/features/inventory/hook"
import { filterTonKho, enrichTonKho, type TonKhoRow } from "@/features/inventory/lib"
import type { InventoryListFilters } from "@/features/inventory/types"
import { buildInventoryColumns } from "@/features/inventory/columns/inventory-columns"
import { DataTableBase } from "@/shared/components/common/DataTableBase"
import { InventoryActionDialog } from "@/features/inventory/components/InventoryActionDialog"
import { TRANG_THAI_TON_LABEL } from "@/features/inventory/types"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"

const defaultFilters: InventoryListFilters = {
  search: "",
  trangThai: "all",
}

export default function InventoryPage() {
  const navigate = useNavigate()
  const inv = useInventory()
  const [filters, setFilters] = React.useState(defaultFilters)
  const [adjustItem, setAdjustItem] = React.useState<TonKhoRow | null>(null)
  const [importOpen, setImportOpen] = React.useState(false)
  const [checkOpen, setCheckOpen] = React.useState(false)
  const [focusedId, setFocusedId] = React.useState<string | null>(null)
  const tableRef = React.useRef<HTMLDivElement>(null)

  const rows = React.useMemo(() => {
    if (focusedId) {
      const item = inv.items.find((i) => i.id === focusedId)
      return item ? [enrichTonKho(item)] : []
    }
    return filterTonKho(inv.items, filters)
  }, [inv.items, filters, focusedId])

  const filterKey = React.useMemo(
    () => [filters.search, filters.trangThai, focusedId ?? "", rows.length].join("|"),
    [filters, focusedId, rows.length],
  )

  const {
    updateThreshold,
    demoReserve,
    demoRelease,
    demoSell,
    demoReturn,
    demoUnreturn,
    demoUnsell,
  } = inv

  const columns = React.useMemo(
    () =>
      buildInventoryColumns({
        onAdjust: setAdjustItem,
        onThreshold: updateThreshold,
        onDemoReserve: (row) => demoReserve(row.id, 1),
        onDemoRelease: (row) => demoRelease(row.id, 1),
        onDemoSell: (row) => demoSell(row.id, 1),
        onDemoReturn: (row) => demoReturn(row.id, 1),
        onDemoUnreturn: (row) => demoUnreturn(row.id, 1),
        onDemoUnsell: (row) => demoUnsell(row.id, 1),
      }),
    [
      updateThreshold,
      demoReserve,
      demoRelease,
      demoSell,
      demoReturn,
      demoUnreturn,
      demoUnsell,
    ],
  )

  const handleSelectAlertProduct = React.useCallback((id: string) => {
    setFocusedId(id)
    requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [])

  const handleFiltersChange = React.useCallback((next: InventoryListFilters) => {
    setFocusedId(null)
    setFilters(next)
  }, [])

  const handleResetFilters = React.useCallback(() => {
    setFocusedId(null)
    setFilters(defaultFilters)
  }, [])

  const topSellingData = React.useMemo(() => {
    return [...inv.items]
      .sort((a, b) => b.daBan - a.daBan)
      .slice(0, 5)
      .map((item) => ({
        name: item.tenSanPham.length > 20 ? item.tenSanPham.substring(0, 20) + "..." : item.tenSanPham,
        "Đã bán": item.daBan,
      }))
  }, [inv.items])

  const movementData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split("T")[0]
    })

    const dataMap = last7Days.reduce(
      (acc, date) => {
        acc[date] = { date, "Nhập kho": 0, "Xuất bán": 0 }
        return acc
      },
      {} as Record<string, { date: string; "Nhập kho": number; "Xuất bán": number }>,
    )

    inv.movements.forEach((m) => {
      const date = m.thoiGian.split("T")[0]
      if (dataMap[date]) {
        if (m.loai === "NHAP_KHO") {
          dataMap[date]["Nhập kho"] += m.soLuong
        } else if (m.loai === "BAN_HANG") {
          dataMap[date]["Xuất bán"] += Math.abs(m.soLuong)
        }
      }
    })

    return Object.values(dataMap).map((d) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    }))
  }, [inv.movements])

  const attentionList = React.useMemo(() => {
    return inv.items
      .map(enrichTonKho)
      .filter((r) => r.trangThai !== "CON_HANG")
      .slice(0, 5)
  }, [inv.items])

  const toolbarConfig = React.useMemo(() => ({
    title: "Bộ lọc tồn kho",
    description: "Tìm theo tên, SKU, trạng thái",
    onReset: handleResetFilters,
    fields: [
      {
        type: "search" as const,
        placeholder: "Tên sản phẩm hoặc SKU...",
        value: filters.search,
        onChange: (v: string) => handleFiltersChange({ ...filters, search: v }),
      },
      {
        type: "select" as const,
        placeholder: "Trạng thái",
        value: filters.trangThai,
        onChange: (v: string) => handleFiltersChange({ ...filters, trangThai: v as InventoryListFilters["trangThai"] }),
        options: [
          { value: "all", label: "Tất cả trạng thái" },
          ...Object.keys(TRANG_THAI_TON_LABEL).map((k) => ({
            value: k,
            label: TRANG_THAI_TON_LABEL[k as keyof typeof TRANG_THAI_TON_LABEL],
          })),
        ],
      },
    ],
  }), [filters, handleFiltersChange, handleResetFilters])

  const deleteConfig = React.useMemo(() => ({
    title: "Xóa sản phẩm khỏi kho?",
    getConfirmName: (row: TonKhoRow) => `${row.tenSanPham} (SKU: ${row.sku})`,
    onConfirm: (row: TonKhoRow) => inv.deleteItem(row.id),
  }), [inv])

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:gap-3">
      {/* Low Stock Alerts & Charts grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Low Stock Alerts */}
        <div className="md:col-span-1 lg:col-span-3">
          <Card className="h-full flex flex-col rounded-sm border-primary/20 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-primary/5 dark:bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 space-y-0 shrink-0">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-foreground">Sản phẩm cần lưu ý</CardTitle>
                <p className="text-xs leading-normal text-muted-foreground">
                  Các sản phẩm sắp hết hàng hoặc đã hết hàng
                </p>
              </div>
              <AlertTriangle className="size-4.5 text-amber-500 animate-pulse" />
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <ScrollArea className="h-[250px] px-6 pb-6">
                <div className="space-y-2.5 pt-1">
                  {attentionList.length > 0 ? (
                    <div className="space-y-2">
                      {attentionList.map((item) => {
                        const statusTone = {
                          SAP_HET_HANG: "border-amber-500/35 bg-amber-500/5 text-amber-900 dark:text-amber-100",
                          HET_HANG: "border-rose-500/35 bg-rose-500/5 text-rose-900 dark:text-rose-100",
                          CON_HANG: "border-border bg-card text-foreground"
                        }
                        const textTone = {
                          SAP_HET_HANG: "text-amber-700 dark:text-amber-300",
                          HET_HANG: "text-rose-700 dark:text-rose-300",
                          CON_HANG: "text-muted-foreground"
                        }
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectAlertProduct(item.id)}
                            className={cn(
                              "w-full flex items-center justify-between rounded-sm border p-2.5 text-left transition-all hover:bg-primary/[0.04] cursor-pointer",
                              statusTone[item.trangThai as keyof typeof statusTone] || "border-border bg-card"
                            )}
                          >
                            <div className="min-w-0 pr-3">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {item.tenSanPham}
                              </p>
                              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                {item.bienThe} · {item.sku}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] font-semibold text-muted-foreground">
                                Tồn: <span className={cn("text-xs font-bold tabular-nums", textTone[item.trangThai as keyof typeof textTone])}>{item.tonKhaDung}</span>
                              </p>
                              <span className={cn(
                                "inline-flex mt-1 rounded-[2px] border px-1.5 py-0.5 text-[9px] font-semibold tracking-wide",
                                item.trangThai === "SAP_HET_HANG" ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300" : "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                              )}>
                                {item.trangThai === "SAP_HET_HANG" ? "Sắp hết" : "Hết hàng"}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Không có cảnh báo tồn kho.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Charts tab */}
        <div className="md:col-span-1 lg:col-span-4">
          <Card className="h-full flex flex-col rounded-sm border-primary/20 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-primary/5 dark:bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 space-y-0 shrink-0">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-foreground">Phân tích kho hàng</CardTitle>
                <p className="text-xs leading-normal text-muted-foreground">
                  Thống kê bán chạy và biến động nhập xuất 7 ngày qua
                </p>
              </div>
              <BarChart3 className="size-4.5 text-primary" />
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-[210px] w-full">
                  <p className="mb-2 text-center text-xs font-medium text-muted-foreground">Top 5 sản phẩm bán chạy</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSellingData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-primary/5" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ fontSize: "10px" }} />
                      <Bar dataKey="Đã bán" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} className="fill-primary" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[210px] w-full">
                  <p className="mb-2 text-center text-xs font-medium text-muted-foreground">Xu hướng nhập - xuất 7 ngày</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={movementData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorNhap" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorXuat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-primary/5" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ fontSize: "10px" }} />
                      <Area type="monotone" dataKey="Nhập kho" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorNhap)" />
                      <Area type="monotone" dataKey="Xuất bán" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorXuat)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        <Card className="rounded-sm border-primary/20 bg-card p-3 shadow-none lg:col-span-2">
          <CardContent className="flex items-center gap-3 p-1">
            <div className="flex size-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Warehouse className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tổng số lượng tồn kho</p>
              <h3 className="text-lg font-bold tabular-nums text-foreground mt-0.5">{inv.stats.tongTonKho}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-sm border-primary/20 bg-card p-3 shadow-none lg:col-span-2">
          <CardContent className="flex items-center gap-3 p-1">
            <div className="flex size-10 items-center justify-center rounded-sm bg-sky-500/10 text-sky-500">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tổng sản phẩm</p>
              <h3 className="text-lg font-bold tabular-nums text-foreground mt-0.5">{inv.stats.tongBienThe}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-sm border-primary/20 bg-card p-3 shadow-none lg:col-span-2">
          <CardContent className="flex items-center gap-3 p-1">
            <div className="flex size-10 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-500">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Đã bán</p>
              <h3 className="text-lg font-bold tabular-nums text-foreground mt-0.5">{inv.stats.daBan}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-sm border-primary/20 bg-card p-3 shadow-none lg:col-span-2">
          <CardContent className="flex items-center gap-3 p-1">
            <div className="flex size-10 items-center justify-center rounded-sm bg-indigo-500/10 text-indigo-500">
              <Lock className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Đang giữ</p>
              <h3 className="text-lg font-bold tabular-nums text-foreground mt-0.5">{inv.stats.dangGiu}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-sm border-primary/20 bg-card p-3 shadow-none lg:col-span-2">
          <CardContent className="flex items-center gap-3 p-1">
            <div className="flex size-10 items-center justify-center rounded-sm bg-amber-500/10 text-amber-500">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Sắp hết hàng</p>
              <h3 className="text-lg font-bold tabular-nums mt-0.5 text-amber-600 dark:text-amber-500">{inv.stats.sapHetHang}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-sm border-primary/20 bg-card p-3 shadow-none lg:col-span-2">
          <CardContent className="flex items-center gap-3 p-1">
            <div className="flex size-10 items-center justify-center rounded-sm bg-rose-500/10 text-rose-500">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Đã hết hàng</p>
              <h3 className="text-lg font-bold tabular-nums mt-0.5 text-rose-600 dark:text-rose-500">{inv.stats.hetHang}</h3>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-1.5 p-1 lg:col-span-1 justify-center">
          <Button
            type="button"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="w-full gap-1 text-[10px] px-2 h-7.5 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer rounded-sm"
          >
            <PackagePlus className="size-3.5" />
            Nhập kho
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCheckOpen(true)}
            className="w-full gap-1 text-[10px] px-2 h-7.5 border-primary/25 hover:bg-primary/10 hover:text-primary cursor-pointer rounded-sm"
          >
            <ClipboardCheck className="size-3.5" />
            Kiểm kho
          </Button>
        </div>
      </div>

      {/* Action panel & Table Toolbar */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground select-none">Thao tác nhanh:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-sm border-primary/20 hover:bg-primary/10 hover:text-primary hover:cursor-pointer text-xs"
            onClick={() => navigate("/inventory/history")}
          >
            <History className="size-4" />
            Lịch sử kho
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div ref={tableRef}>
        <DataTableBase
          data={rows}
          columns={columns}
          filterKey={filterKey}
          highlightedRowId={focusedId}
          emptyMessage="Không có dữ liệu phù hợp bộ lọc."
          pageSizeLabel="sản phẩm / trang"
          toolbarConfig={toolbarConfig}
          deleteConfig={deleteConfig}
        />
      </div>

      {/* Dialogs */}
      <InventoryActionDialog
        mode="adjust"
        item={adjustItem}
        open={adjustItem != null}
        onOpenChange={(o) => !o && setAdjustItem(null)}
        onSubmit={inv.adjustStock}
      />

      <InventoryActionDialog
        mode="import"
        items={inv.items}
        open={importOpen}
        onOpenChange={setImportOpen}
        onSubmit={inv.importStock}
      />

      <InventoryActionDialog
        mode="check"
        items={inv.items}
        open={checkOpen}
        onOpenChange={setCheckOpen}
        onSubmit={inv.stockCheck}
      />
    </div>
  )
}
