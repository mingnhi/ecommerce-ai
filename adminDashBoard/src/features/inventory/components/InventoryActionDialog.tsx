/* eslint-disable react-hooks/incompatible-library */
import { useEffect, useState, useRef, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Minus, Plus, Trash2, Check, Download } from "lucide-react"
import type { ITonKhoSanPham, IPhieuNhapKho, ILichSuKho } from "@/features/inventory/types"
import { stockCheckSchema, importStockSchema, type ImportStockForm } from "@/shared/lib/validations/inventory-schema"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { InventorySelectPopover } from "@/features/inventory/components/InventorySelectPopover"
import { MOCK_NHA_CUNG_CAP } from "@/faker/mock-inventory"
import { Paper, DataTable, TableRow, TableCell } from "@/shared/components/ui/react-receipt-slip"
import { exportReceiptPdf } from "@/features/inventory/lib"
import { ScrollArea } from "@/shared/components/ui/scroll-area"

const localAdjustStockSchema = z.object({ soLuong: z.number(), ghiChu: z.string().optional() })
type LocalAdjustStockForm = z.infer<typeof localAdjustStockSchema>

type BaseProps = { open: boolean; onOpenChange: (open: boolean) => void }
type AdjustProps = {
  mode: "adjust"
  item: ITonKhoSanPham | null
  onSubmit: (id: string, form: { loai: "NHAP_KHO" | "DIEU_CHINH"; soLuong: number; ghiChu: string; huong?: "tang" | "giam" }) => void
}
type CheckProps = { mode: "check"; items: ITonKhoSanPham[]; onSubmit: (form: { tonKhoId: string; thucTe: number; thang?: string; ghiChu?: string }) => void }
type ImportProps = { mode: "import"; items: ITonKhoSanPham[]; onSubmit: (form: ImportStockForm) => IPhieuNhapKho | null }
type ViewProps = { mode: "view"; movement: ILichSuKho | null }
export type InventoryActionDialogProps = BaseProps & (AdjustProps | CheckProps | ImportProps | ViewProps)

import { cn } from "@/shared/lib/utils"

function QuantityController({
  value,
  onDecrement,
  onIncrement,
  onChange,
  onBlur,
}: {
  value: string | number
  onDecrement: () => void
  onIncrement: () => void
  onChange: (v: string) => void
  onBlur?: () => void
}) {
  return (
    <div className="flex h-10 w-full items-center overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-background/60 shadow-sm transition-all focus-within:border-sky-500 focus-within:ring-3 focus-within:ring-sky-500/15">
      <button
        type="button"
        onClick={onDecrement}
        className="flex h-full w-12 items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-95 transition-all border-r border-slate-200 dark:border-slate-800 cursor-pointer shrink-0"
      >
        <Minus className="size-4 stroke-[2.5]" />
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="h-full w-full bg-transparent border-0 outline-none text-center font-extrabold text-sm tabular-nums text-slate-800 dark:text-slate-200 p-0 focus-visible:ring-0 focus-visible:border-0"
      />
      <button
        type="button"
        onClick={onIncrement}
        className="flex h-full w-12 items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-95 transition-all border-l border-slate-200 dark:border-slate-800 cursor-pointer shrink-0"
      >
        <Plus className="size-4 stroke-[2.5]" />
      </button>
    </div>
  )
}

export function InventoryActionDialog(props: InventoryActionDialogProps) {
  const { open, onOpenChange, mode } = props
  const [quantity, setQuantity] = useState(0)
  const [inputValue, setInputValue] = useState("0")
  const [successPhieu, setSuccessPhieu] = useState<IPhieuNhapKho | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const checkForm = useForm({
    resolver: zodResolver(stockCheckSchema),
    defaultValues: { tonKhoId: "", thucTe: 0, thang: new Date().toISOString().slice(0, 7), ghiChu: "" },
  })

  const adjustForm = useForm<LocalAdjustStockForm>({
    resolver: zodResolver(localAdjustStockSchema),
    defaultValues: { soLuong: 0, ghiChu: "" },
  })

  const importForm = useForm<ImportStockForm>({
    resolver: zodResolver(importStockSchema),
    defaultValues: { nhaCungCap: MOCK_NHA_CUNG_CAP[0]?.ten ?? "", ghiChu: "", chiTiet: [{ tonKhoId: "", soLuong: 10 }] },
  })

  const { fields, append, remove } = useFieldArray({ control: importForm.control, name: "chiTiet" })

  useEffect(() => {
    if (!open) {
      if (mode === "adjust") {
        setQuantity(0)
        setInputValue("0")
        adjustForm.reset({ soLuong: 0, ghiChu: "" })
      } else if (mode === "check") {
        const items = (props as CheckProps).items || []
        checkForm.reset({ tonKhoId: items[0]?.id ?? "", thucTe: items[0]?.tonKhaDung ?? 0, thang: new Date().toISOString().slice(0, 7), ghiChu: "" })
      } else if (mode === "import") {
        setSuccessPhieu(null)
        const items = (props as ImportProps).items || []
        importForm.reset({ nhaCungCap: MOCK_NHA_CUNG_CAP[0]?.ten ?? "", ghiChu: "", chiTiet: [{ tonKhoId: items[0]?.id ?? "", soLuong: 10 }] })
      }
    } else {
      if (mode === "check") {
        const items = (props as CheckProps).items || []
        checkForm.setValue("tonKhoId", items[0]?.id ?? "")
        checkForm.setValue("thucTe", items[0]?.tonKhaDung ?? 0)
        checkForm.setValue("thang", new Date().toISOString().slice(0, 7))
      } else if (mode === "import") {
        const items = (props as ImportProps).items || []
        importForm.setValue("chiTiet.0.tonKhoId", items[0]?.id ?? "")
      }
    }
  }, [open, mode, props, adjustForm, checkForm, importForm])

  const adjustItem = mode === "adjust" ? (props as AdjustProps).item : null
  const adjustPreview = adjustItem ? adjustItem.tonKhaDung + quantity : 0

  const handleAdjustIncrement = () => {
    const newQ = quantity + 1
    setQuantity(newQ)
    setInputValue(newQ > 0 ? `+${newQ}` : newQ.toString())
  }

  const handleAdjustDecrement = () => {
    const newQ = quantity - 1
    setQuantity(newQ)
    setInputValue(newQ > 0 ? `+${newQ}` : newQ.toString())
  }

  const handleAdjustInputChange = (val: string) => {
    if (val === "" || val === "-" || val === "+") {
      setInputValue(val)
      setQuantity(0)
      return
    }
    const clean = val.replace(/[^0-9+-]/g, "")
    const num = Number(clean)
    if (!Number.isNaN(num)) {
      setQuantity(num)
      setInputValue(clean)
    }
  }

  const handleAdjustInputBlur = () => {
    if (inputValue === "" || inputValue === "-" || inputValue === "+") {
      setInputValue("0")
      setQuantity(0)
    } else {
      setInputValue(quantity > 0 ? `+${quantity}` : quantity.toString())
    }
  }

  const handleAdjustSubmit = (data: LocalAdjustStockForm) => {
    if (mode !== "adjust" || !adjustItem || quantity === 0) return
    const isIncrease = quantity > 0
    const absQty = Math.abs(quantity)
    const onSubmit = (props as AdjustProps).onSubmit
    if (onSubmit) {
      onSubmit(adjustItem.id, {
        loai: isIncrease ? "NHAP_KHO" : "DIEU_CHINH",
        soLuong: absQty,
        ghiChu: data.ghiChu || "",
        huong: isIncrease ? undefined : "giam",
      })
    }
    onOpenChange(false)
  }

  const checkTonKhoId = checkForm.watch("tonKhoId")
  const checkThucTe = checkForm.watch("thucTe")
  const checkItems = mode === "check" ? (props as CheckProps).items || [] : []
  const checkItem = checkItems.find((i) => i.id === checkTonKhoId)
  const checkChenhLech = checkItem ? checkThucTe - checkItem.tonKhaDung : 0

  const handleCheckSubmit = (data: { tonKhoId: string; thucTe: number; thang?: string; ghiChu?: string }) => {
    if (mode !== "check") return
    const onSubmit = (props as CheckProps).onSubmit
    if (onSubmit) onSubmit(data)
    onOpenChange(false)
  }

  const viewMovement = mode === "view" ? (props as ViewProps).movement : null
  const viewPhieu = useMemo(() => {
    if (!viewMovement) return null
    return {
      maPhieu: viewMovement.loai === "NHAP_KHO" ? `PN-${viewMovement.id.slice(-6).toUpperCase()}` : (viewMovement.loai === "BAN_HANG" ? `PX-${viewMovement.id.slice(-6).toUpperCase()}` : `PC-${viewMovement.id.slice(-6).toUpperCase()}`),
      tieuDe: viewMovement.loai === "NHAP_KHO" ? "PHIẾU NHẬP KHO" : (viewMovement.loai === "BAN_HANG" ? "PHIẾU XUẤT KHO" : "PHIẾU ĐIỀU CHỈNH KHO"),
      doiTacLabel: viewMovement.loai === "NHAP_KHO" ? "Thông tin nhà cung cấp" : (viewMovement.loai === "BAN_HANG" ? "Thông tin khách hàng" : "Thông tin điều chỉnh"),
      doiTacValue: viewMovement.loai === "NHAP_KHO" ? "Nhà cung cấp đối tác" : (viewMovement.loai === "BAN_HANG" ? "Khách hàng mua lẻ" : "Kho nội bộ"),
      ngayNhap: new Date(viewMovement.thoiGian).toLocaleDateString("vi-VN"),
      ghiChu: viewMovement.ghiChu || "Phiếu được tạo tự động từ hệ thống",
      nguoiTao: viewMovement.nguoiThaoTac || "Hệ thống",
      chiTiet: [
        {
          id: "ct-1",
          tonKhoId: viewMovement.tonKhoId,
          tenSanPham: viewMovement.tenSanPham,
          sku: viewMovement.sku,
          soLuong: Math.abs(viewMovement.soLuong),
        }
      ]
    }
  }, [viewMovement])

  const activePhieu = successPhieu || viewPhieu

  const resolvedPhieu = useMemo(() => {
    if (!activePhieu) return null
    if ("tieuDe" in activePhieu) return activePhieu
    return {
      maPhieu: activePhieu.maPhieu,
      tieuDe: "PHIẾU NHẬP KHO",
      doiTacLabel: "Thông tin nhà cung cấp",
      doiTacValue: activePhieu.nhaCungCap,
      ngayNhap: activePhieu.ngayNhap,
      ghiChu: activePhieu.ghiChu || "Phiếu được tạo tự động từ hệ thống",
      nguoiTao: activePhieu.nguoiTao,
      chiTiet: activePhieu.chiTiet,
    }
  }, [activePhieu])

  const handleDownloadPdf = () => {
    if (!resolvedPhieu || !printRef.current) return
    const prefix = resolvedPhieu.maPhieu.startsWith("PN") ? "Phieu_Nhap_Kho" : (resolvedPhieu.maPhieu.startsWith("PX") ? "Phieu_Xuat_Kho" : "Phieu_Dieu_Chinh_Kho")
    void exportReceiptPdf(printRef.current, `${prefix}_${resolvedPhieu.maPhieu}.pdf`)
  }

  const handleImportSubmit = (data: ImportStockForm) => {
    if (mode !== "import") return
    const onSubmit = (props as ImportProps).onSubmit
    if (onSubmit) {
      const phieu = onSubmit(data)
      if (phieu) setSuccessPhieu(phieu)
      else onOpenChange(false)
    }
  }

  const renderFooter = (submitLabel: string, disabled = false) => (
    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-900 mt-6">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-4 text-xs font-semibold rounded-lg hover:cursor-pointer border-slate-200 dark:border-slate-800">
        Hủy
      </Button>
      <Button type="submit" disabled={disabled} className="h-10 px-5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 hover:cursor-pointer shadow-sm transition-all active:scale-95">
        {submitLabel}
      </Button>
    </div>
  )

  const contentClassName = cn(
    "overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl p-6 flex flex-col gap-0",
    mode === "import" || mode === "view"
      ? activePhieu
        ? "max-h-[95vh] sm:max-w-4xl"
        : "max-h-[90vh] overflow-y-auto sm:max-w-lg"
      : "sm:max-w-md"
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        {mode === "adjust" && adjustItem && (
          <>
            <DialogHeader className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-900">
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">Chỉnh sửa tồn kho</DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {adjustItem.tenSanPham} <span className="mx-1.5 text-slate-300 dark:text-slate-700">|</span> <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">{adjustItem.sku}</code>
              </p>
            </DialogHeader>
            <form className="space-y-5 pt-3" onSubmit={adjustForm.handleSubmit(handleAdjustSubmit)}>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số lượng thay đổi</Label>
                <QuantityController
                  value={inputValue}
                  onDecrement={handleAdjustDecrement}
                  onIncrement={handleAdjustIncrement}
                  onChange={handleAdjustInputChange}
                  onBlur={handleAdjustInputBlur}
                />
                <p className="text-[10px] text-muted-foreground leading-normal italic">Dương (+) = Tăng tồn kho, Âm (-) = Giảm tồn kho</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ghi chú / lý do điều chỉnh</Label>
                <Textarea
                  rows={3}
                  {...adjustForm.register("ghiChu")}
                  placeholder="Nhập lý do chi tiết thay đổi tồn kho..."
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-background/50 text-sm focus-visible:ring-3 focus-visible:ring-sky-500/10 focus-visible:border-sky-500 transition-all placeholder:text-muted-foreground/60 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5 p-1 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900">
                <div className="p-3 text-center rounded-lg bg-white dark:bg-slate-950 border border-slate-100/80 dark:border-slate-900/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tồn kho hiện tại</span>
                  <p className="mt-1.5 text-xl font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">{adjustItem.tonKhaDung}</p>
                </div>
                <div className="p-3 text-center rounded-lg bg-white dark:bg-slate-950 border border-slate-100/80 dark:border-slate-900/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tồn kho dự kiến</span>
                  <p className={`mt-1.5 text-xl font-extrabold tabular-nums transition-colors duration-200 ${adjustPreview < 0 ? "text-rose-500 animate-pulse font-black" : adjustPreview === adjustItem.tonKhaDung ? "text-slate-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {adjustPreview}
                  </p>
                </div>
              </div>
              {renderFooter("Xác nhận", quantity === 0)}
            </form>
          </>
        )}

        {mode === "check" && (
          <>
            <DialogHeader className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-900">
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">Kiểm kho định kỳ</DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">Kiểm kê thực tế và khớp số lượng tồn kho hệ thống</p>
            </DialogHeader>
            <form className="space-y-5 pt-3" onSubmit={checkForm.handleSubmit(handleCheckSubmit)}>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sản phẩm kiểm kê</Label>
                <InventorySelectPopover
                  type="product"
                  items={checkItems}
                  value={checkTonKhoId}
                  onChange={(v) => {
                    checkForm.setValue("tonKhoId", v)
                    const picked = checkItems.find((i) => i.id === v)
                    if (picked) checkForm.setValue("thucTe", picked.tonKhaDung)
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kỳ kiểm kho (Tháng)</Label>
                  <Input type="month" {...checkForm.register("thang")} className="h-10 border border-slate-200 dark:border-slate-800 bg-background/50 text-sm focus-visible:ring-3 focus-visible:ring-sky-500/10 focus-visible:border-sky-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số lượng thực tế</Label>
                  <QuantityController
                    value={checkThucTe}
                    onDecrement={() => checkForm.setValue("thucTe", Math.max(0, checkThucTe - 1))}
                    onIncrement={() => checkForm.setValue("thucTe", checkThucTe + 1)}
                    onChange={(v) => checkForm.setValue("thucTe", Math.max(0, Number(v.replace(/[^0-9]/g, ""))))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ghi chú kiểm kho</Label>
                <Textarea
                  rows={2}
                  {...checkForm.register("ghiChu")}
                  placeholder="Nhập ghi chú kiểm kho nếu có..."
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-background/50 text-sm focus-visible:ring-3 focus-visible:ring-sky-500/10 focus-visible:border-sky-500 transition-all placeholder:text-muted-foreground/60 resize-none"
                />
              </div>
              {checkItem && (
                <div className="rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/30 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3 text-center rounded-lg bg-white dark:bg-slate-950 border border-slate-100/80 dark:border-slate-900/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tồn hệ thống</span>
                      <p className="mt-1.5 text-base font-bold text-slate-500 tabular-nums">{checkItem.tonKhaDung}</p>
                    </div>
                    <div className="p-3 text-center rounded-lg bg-white dark:bg-slate-950 border border-slate-100/80 dark:border-slate-900/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tồn thực tế</span>
                      <p className="mt-1.5 text-base font-bold text-slate-800 dark:text-slate-200 tabular-nums">{checkThucTe}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-900 text-center">
                    {checkChenhLech !== 0 ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border border-amber-100/60 dark:border-amber-900/40">
                        <span>Lệch điều chỉnh:</span>
                        <span className={cn("font-extrabold tabular-nums", checkChenhLech > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                          {checkChenhLech > 0 ? `+${checkChenhLech}` : checkChenhLech}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/40">
                        <Check className="size-3.5 stroke-[3]" />
                        <span>Khớp tồn kho hệ thống (100%)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {renderFooter("Xác nhận kiểm kho", !checkItem || checkChenhLech === 0)}
            </form>
          </>
        )}

        {(mode === "import" || mode === "view") && (
          <>
            {resolvedPhieu ? (
              <>
                <DialogHeader className="pb-3 border-b border-sky-500/5">
                  <DialogTitle className="text-center font-bold text-base text-foreground">
                    {mode === "view" ? "Chi tiết chứng từ kho" : "Nhập kho thành công"}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center text-center my-3">
                  {mode === "import" ? (
                    <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                      <Check className="size-6 stroke-[3]" />
                    </div>
                  ) : null}
                  <h3 className="font-bold text-sm text-foreground">
                    {mode === "import" ? "Ghi nhận phiếu nhập thành công!" : "Thông tin chứng từ kho"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hệ thống trích xuất phiếu <span className="font-semibold text-sky-500">{resolvedPhieu.maPhieu}</span> kích thước chuẩn A4.
                  </p>
                </div>
                <style dangerouslySetInnerHTML={{
                  __html: `
                  @media print {
                    @page { size: A4 portrait; margin: 15mm 12mm; }
                    body { background: #ffffff !important; color: #000000 !important; font-family: Arial, sans-serif !important; }
                    #receipt-slip-content { padding: 0 !important; box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; background: #ffffff !important; }
                  }
                `}} />
                <ScrollArea className="h-[50vh] border border-sky-500/10 rounded-sm bg-muted/10">
                  <div className="p-4 flex justify-center items-start">
                    <div ref={printRef} id="receipt-slip-content" className="bg-white w-[210mm] max-w-full shrink-0">
                      <Paper size="A4" style={{ padding: "30px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                          <div>
                            <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: 0, color: "#111827" }}>CỬA HÀNG E-COMMERCE AI</h2>
                            <p style={{ fontSize: "11px", color: "#4B5563", margin: "2px 0 0 0" }}>Địa chỉ: 123 Đường AI, Cầu Giấy, Hà Nội</p>
                            <p style={{ fontSize: "11px", color: "#4B5563", margin: "2px 0 0 0" }}>Hotline: 1900 6688 · contact@ecommerce-ai.vn</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <h1 style={{ fontSize: "18px", fontWeight: "extrabold", margin: 0, color: "#2563EB" }}>
                              {resolvedPhieu.tieuDe}
                            </h1>
                            <p style={{ fontSize: "11px", color: "#4B5563", margin: "4px 0 0 0" }}>Số phiếu: <b>{resolvedPhieu.maPhieu}</b></p>
                            <p style={{ fontSize: "11px", color: "#4B5563", margin: "2px 0 0 0" }}>Ngày lập: {resolvedPhieu.ngayNhap}</p>
                          </div>
                        </div>
                        <div style={{ borderTop: "2px solid #2563EB", marginBottom: "20px" }} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px", fontSize: "11px", color: "#1F2937" }}>
                          <div style={{ backgroundColor: "#F9FAFB", padding: "12px", borderRadius: "2px", border: "1px solid #E5E7EB" }}>
                            <p style={{ margin: "0 0 6px 0", color: "#4B5563", fontWeight: "bold", fontSize: "10px", textTransform: "uppercase" }}>
                              {resolvedPhieu.doiTacLabel}
                            </p>
                            <p style={{ margin: "2px 0" }}><b>Tên:</b> {resolvedPhieu.doiTacValue}</p>
                            <p style={{ margin: "2px 0" }}><b>Liên hệ:</b> Phân phối ủy quyền chính thức</p>
                          </div>
                          <div style={{ backgroundColor: "#F9FAFB", padding: "12px", borderRadius: "2px", border: "1px solid #E5E7EB" }}>
                            <p style={{ margin: "0 0 6px 0", color: "#4B5563", fontWeight: "bold", fontSize: "10px", textTransform: "uppercase" }}>Thông tin giao nhận</p>
                            <p style={{ margin: "2px 0" }}><b>Người lập phiếu:</b> {resolvedPhieu.nguoiTao}</p>
                            <p style={{ margin: "2px 0" }}><b>Kho nhận:</b> Kho Tổng Hà Nội (Kho A1)</p>
                          </div>
                        </div>
                        <DataTable style={{ border: "1px solid #E5E7EB", borderRadius: "2px" }}>
                          <thead>
                            <tr style={{ backgroundColor: "#F3F4F6", borderBottom: "2px solid #D1D5DB" }}>
                              <TableCell align="center" style={{ width: "60px", fontWeight: "bold", color: "#374151" }}>STT</TableCell>
                              <TableCell align="left" style={{ fontWeight: "bold", color: "#374151" }}>Sản phẩm / Quy cách</TableCell>
                              <TableCell align="left" style={{ width: "160px", fontWeight: "bold", color: "#374151" }}>Mã SKU</TableCell>
                              <TableCell align="center" style={{ width: "80px", fontWeight: "bold", color: "#374151" }}>Đơn vị</TableCell>
                              <TableCell align="right" style={{ width: "100px", fontWeight: "bold", color: "#374151", paddingRight: "16px" }}>Số lượng</TableCell>
                            </tr>
                          </thead>
                          <tbody>
                            {resolvedPhieu.chiTiet.map((line, idx) => (
                              <TableRow key={line.id || idx} style={{ borderBottom: "1px solid #E5E7EB" }}>
                                <TableCell align="center" style={{ color: "#4B5563" }}>{idx + 1}</TableCell>
                                <TableCell align="left"><div style={{ fontWeight: "bold", color: "#111827" }}>{line.tenSanPham}</div></TableCell>
                                <TableCell align="left"><code style={{ backgroundColor: "#F3F4F6", padding: "2px 6px", borderRadius: "2px", fontSize: "10px", color: "#1F2937" }}>{line.sku}</code></TableCell>
                                <TableCell align="center" style={{ color: "#4B5563" }}>Cái</TableCell>
                                <TableCell align="right" style={{ fontWeight: "bold", color: "#111827", paddingRight: "16px" }}>{line.soLuong}</TableCell>
                              </TableRow>
                            ))}
                          </tbody>
                        </DataTable>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                          <div style={{ width: "55%" }}>
                            {resolvedPhieu.ghiChu && (
                              <div style={{ border: "1px solid #E5E7EB", padding: "10px", borderRadius: "2px", backgroundColor: "#FCFDFD" }}>
                                <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "10.5px", color: "#4B5563" }}>Ghi chú phiếu:</p>
                                <p style={{ margin: 0, fontSize: "11px", color: "#1F2937", lineHeight: "1.4" }}>{resolvedPhieu.ghiChu}</p>
                              </div>
                            )}
                          </div>
                          <div style={{ width: "40%", textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #E5E7EB", fontSize: "11px" }}>
                              <span style={{ color: "#4B5563" }}>Tổng sản phẩm:</span>
                              <span style={{ fontWeight: "bold", color: "#111827" }}>{resolvedPhieu.chiTiet.length}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "12px" }}>
                              <span style={{ fontWeight: "bold", color: "#111827" }}>Tổng số lượng:</span>
                              <span style={{ fontWeight: "extrabold", color: "#2563EB" }}>
                                {resolvedPhieu.chiTiet.reduce((sum, item) => sum + item.soLuong, 0)} cái
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", fontSize: "11px", color: "#1F2937" }}>
                          {["Người giao hàng", "Thủ kho nhận", "Người lập phiếu"].map((role) => (
                            <div key={role} style={{ textAlign: "center", width: "30%" }}>
                              <p style={{ fontWeight: "bold", margin: 0 }}>{role}</p>
                              <p style={{ margin: "2px 0 0 0", fontSize: "9px", color: "#6B7280" }}>(Ký và ghi rõ họ tên)</p>
                              <div style={{ height: "40px" }} />
                            </div>
                          ))}
                        </div>
                      </Paper>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-sky-500/5">
                  <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="hover:cursor-pointer">Đóng</Button>
                  <Button type="button" size="sm" onClick={handleDownloadPdf} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm hover:cursor-pointer">
                    <Download className="size-4" />Tải xuống PDF
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader><DialogTitle>Nhập kho</DialogTitle></DialogHeader>
                <form className="space-y-4" onSubmit={importForm.handleSubmit(handleImportSubmit)}>
                  <div className="space-y-2">
                    <Label>Nhà cung cấp</Label>
                    <InventorySelectPopover type="supplier" items={MOCK_NHA_CUNG_CAP} value={importForm.watch("nhaCungCap")} onChange={(v) => importForm.setValue("nhaCungCap", v)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú</Label>
                    <Textarea rows={2} {...importForm.register("ghiChu")} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Chi tiết nhập</Label>
                      <Button type="button" variant="outline" className="hover:cursor-pointer" size="sm" onClick={() => append({ tonKhoId: ((props as ImportProps).items || [])[0]?.id ?? "", soLuong: 1 })}>
                        <Plus className="size-4" />Thêm dòng
                      </Button>
                    </div>
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-center">
                        <InventorySelectPopover type="product" items={(props as ImportProps).items || []} value={importForm.watch(`chiTiet.${index}.tonKhoId`)} onChange={(v) => importForm.setValue(`chiTiet.${index}.tonKhoId`, v)} className="flex-1" />
                        <Input type="number" min={1} className="w-24 py-5" {...importForm.register(`chiTiet.${index}.soLuong`, { valueAsNumber: true })} />
                        <Button type="button" variant="ghost" className="hover:cursor-pointer" size="icon-sm" disabled={fields.length <= 1} onClick={() => remove(index)}><Trash2 className="size-4" /></Button>
                      </div>
                    ))}
                  </div>
                  {renderFooter("Nhập hàng")}
                </form>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
