export const LoaiBienDongKho = {
  NHAP_KHO: "NHAP_KHO",
  GIU_HANG: "GIU_HANG",
  TRA_GIU_HANG: "TRA_GIU_HANG",
  BAN_HANG: "BAN_HANG",
  DIEU_CHINH: "DIEU_CHINH",
} as const

export type LoaiBienDongKho =
  (typeof LoaiBienDongKho)[keyof typeof LoaiBienDongKho]

export type TrangThaiTonKho = "CON_HANG" | "SAP_HET_HANG" | "HET_HANG"

export const LOAI_BIEN_DONG_LABEL: Record<LoaiBienDongKho, string> = {
  [LoaiBienDongKho.NHAP_KHO]: "Nhập kho",
  [LoaiBienDongKho.GIU_HANG]: "Giữ hàng",
  [LoaiBienDongKho.TRA_GIU_HANG]: "Trả giữ hàng",
  [LoaiBienDongKho.BAN_HANG]: "Xuất kho",
  [LoaiBienDongKho.DIEU_CHINH]: "Điều chỉnh",
}

export const TRANG_THAI_TON_LABEL: Record<TrangThaiTonKho, string> = {
  CON_HANG: "Còn hàng",
  SAP_HET_HANG: "Sắp hết hàng",
  HET_HANG: "Hết hàng",
}

export interface ITonKhoSanPham {
  id: string
  productId: string
  tenSanPham: string
  bienThe: string
  sku: string
  anh?: string
  tonKhaDung: number
  dangGiu: number
  daBan: number
  soLuongHoanTra: number
  nguongCanhBao: number
  capNhatLuc: string
  tonLauNgay?: boolean
}

export interface ILichSuKho {
  id: string
  thoiGian: string
  tonKhoId: string
  tenSanPham: string
  sku: string
  loai: LoaiBienDongKho
  soLuong: number
  truocThayDoi: number
  sauThayDoi: number
  ghiChu?: string
  nguoiThaoTac: string
}

export interface IChiTietPhieuNhap {
  id: string
  tonKhoId: string
  tenSanPham: string
  sku: string
  soLuong: number
}

export interface IPhieuNhapKho {
  id: string
  maPhieu: string
  nhaCungCap: string
  ngayNhap: string
  ghiChu?: string
  chiTiet: IChiTietPhieuNhap[]
  nguoiTao: string
}

export interface INhaCungCap {
  id: string
  ten: string
  anh: string
  sdt: string
  email: string
  diaChi: string
}

export interface IPhienKiemKho {
  id: string
  maPhien: string
  tonKhoId: string
  tenSanPham: string
  sku: string
  heThong: number
  thucTe: number
  chenhLech: number
  thoiGian: string
  nguoiKiem: string
}

export interface InventoryStats {
  tongSanPham: number
  tongBienThe: number
  tongTonKho: number
  dangGiu: number
  daBan: number
  sapHetHang: number
  hetHang: number
  tonLauNgay: number
}

export type InventoryListFilters = {
  search: string
  trangThai: TrangThaiTonKho | "all"
}

export type MovementHistoryFilters = {
  loai: LoaiBienDongKho | "all"
  tuNgay: string
  denNgay: string
  search: string
}
