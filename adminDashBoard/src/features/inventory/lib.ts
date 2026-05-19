import html2pdf from "html2pdf.js"
import { LoaiBienDongKho } from "@/features/inventory/types"
import type {
  ILichSuKho,
  ITonKhoSanPham,
  TrangThaiTonKho,
  InventoryListFilters,
  MovementHistoryFilters,
} from "@/features/inventory/types"

export function getTrangThaiTonKho(tonKhaDung: number, nguong: number): TrangThaiTonKho {
  if (tonKhaDung <= 0) return "HET_HANG"
  if (tonKhaDung < nguong) return "SAP_HET_HANG"
  return "CON_HANG"
}

export function enrichTonKho(item: ITonKhoSanPham) {
  return {
    ...item,
    trangThai: getTrangThaiTonKho(item.tonKhaDung, item.nguongCanhBao),
  }
}

export type TonKhoRow = ReturnType<typeof enrichTonKho>

export function filterTonKho(items: ITonKhoSanPham[], f: InventoryListFilters): TonKhoRow[] {
  const q = f.search.trim().toLowerCase()
  return items
    .map(enrichTonKho)
    .filter((row) => {
      if (f.trangThai !== "all" && row.trangThai !== f.trangThai) return false
      if (!q) return true
      return (
        row.tenSanPham.toLowerCase().includes(q) ||
        row.sku.toLowerCase().includes(q) ||
        row.bienThe.toLowerCase().includes(q)
      )
    })
}

export function filterLichSu(items: ILichSuKho[], f: MovementHistoryFilters): ILichSuKho[] {
  const q = f.search.trim().toLowerCase()
  return items.filter((m) => {
    if (f.loai !== "all" && m.loai !== f.loai) return false
    const day = m.thoiGian.slice(0, 10)
    if (f.tuNgay && day < f.tuNgay) return false
    if (f.denNgay && day > f.denNgay) return false
    if (q && !m.tenSanPham.toLowerCase().includes(q) && !m.sku.toLowerCase().includes(q)) {
      return false
    }
    return true
  })
}

export function canApplyMovement(
  item: ITonKhoSanPham,
  loai: LoaiBienDongKho,
  soLuong: number,
): boolean {
  const qty =
    loai === LoaiBienDongKho.DIEU_CHINH && soLuong < 0
      ? Math.abs(soLuong)
      : Math.abs(soLuong)

  switch (loai) {
    case LoaiBienDongKho.NHAP_KHO:
      return qty > 0
    case LoaiBienDongKho.GIU_HANG:
      return item.tonKhaDung >= qty
    case LoaiBienDongKho.TRA_GIU_HANG:
      return item.dangGiu >= qty
    case LoaiBienDongKho.BAN_HANG:
      return item.dangGiu >= qty
    case LoaiBienDongKho.DIEU_CHINH:
      return item.tonKhaDung + soLuong >= 0
    default:
      return false
  }
}

export function createMovement(
  item: ITonKhoSanPham,
  loai: LoaiBienDongKho,
  soLuong: number,
  ghiChu?: string,
  nguoiThaoTac = "Nguyễn Minh Anh",
): { item: ITonKhoSanPham; movement: ILichSuKho } {
  const truoc = item.tonKhaDung
  let tonKhaDung = item.tonKhaDung
  let dangGiu = item.dangGiu
  let daBan = item.daBan

  switch (loai) {
    case LoaiBienDongKho.NHAP_KHO:
      tonKhaDung += soLuong
      break
    case LoaiBienDongKho.GIU_HANG:
      tonKhaDung -= soLuong
      dangGiu += soLuong
      break
    case LoaiBienDongKho.TRA_GIU_HANG:
      tonKhaDung += soLuong
      dangGiu -= soLuong
      break
    case LoaiBienDongKho.BAN_HANG:
      dangGiu -= soLuong
      daBan += soLuong
      break
    case LoaiBienDongKho.DIEU_CHINH:
      tonKhaDung += soLuong
      break
  }

  const updated: ITonKhoSanPham = {
    ...item,
    tonKhaDung,
    dangGiu: Math.max(0, dangGiu),
    daBan: Math.max(0, daBan),
    capNhatLuc: new Date().toISOString(),
  }

  const movement: ILichSuKho = {
    id: `mv-${crypto.randomUUID().slice(0, 8)}`,
    thoiGian: updated.capNhatLuc,
    tonKhoId: item.id,
    tenSanPham: item.tenSanPham,
    sku: item.sku,
    loai,
    soLuong,
    truocThayDoi: truoc,
    sauThayDoi: tonKhaDung,
    ghiChu,
    nguoiThaoTac,
  }

  return { item: updated, movement }
}

export function reserveStock(item: ITonKhoSanPham, qty: number, ref?: string) {
  return createMovement(item, LoaiBienDongKho.GIU_HANG, qty, ref ?? "Giữ hàng khi checkout")
}

export function releaseReserved(item: ITonKhoSanPham, qty: number, ref?: string) {
  return createMovement(item, LoaiBienDongKho.TRA_GIU_HANG, qty, ref ?? "Hoàn giữ hàng — thanh toán thất bại")
}

export function completeSale(item: ITonKhoSanPham, qty: number, ref?: string) {
  return createMovement(item, LoaiBienDongKho.BAN_HANG, qty, ref ?? "Hoàn tất đơn hàng")
}

export function exportReceiptPdf(element: HTMLElement, filename: string) {
  const widthPx = element.offsetWidth || element.scrollWidth
  const heightPx = element.scrollHeight
  const pxToMm = 25.4 / 96

  return html2pdf()
    .set({
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, logging: false },
      jsPDF: {
        unit: "mm",
        format: [widthPx * pxToMm, heightPx * pxToMm],
        orientation: "portrait",
      },
    })
    .from(element)
    .save()
}
