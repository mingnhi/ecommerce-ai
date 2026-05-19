import { z } from "zod"

export const adjustStockSchema = z
  .object({
    loai: z.enum(["NHAP_KHO", "DIEU_CHINH"]),
    huong: z.enum(["tang", "giam"]).optional(),
    soLuong: z.number().positive("Số lượng phải lớn hơn 0"),
    ghiChu: z.string(),
  })
  .refine((d) => d.loai !== "DIEU_CHINH" || d.ghiChu.trim().length > 0, {
    message: "Bắt buộc ghi chú khi điều chỉnh kho",
    path: ["ghiChu"],
  })
  .refine((d) => d.loai !== "DIEU_CHINH" || d.huong != null, {
    message: "Chọn hướng điều chỉnh",
    path: ["huong"],
  })

export type AdjustStockForm = z.infer<typeof adjustStockSchema>

export const importLineSchema = z.object({
  tonKhoId: z.string().min(1, "Chọn sản phẩm"),
  soLuong: z.number().positive("Số lượng phải lớn hơn 0"),
})

export const importStockSchema = z.object({
  nhaCungCap: z.string().min(1, "Nhập tên nhà cung cấp"),
  ghiChu: z.string().optional(),
  chiTiet: z.array(importLineSchema).min(1, "Thêm ít nhất một dòng nhập"),
})

export type ImportStockForm = z.infer<typeof importStockSchema>

export const stockCheckSchema = z.object({
  tonKhoId: z.string().min(1, "Chọn sản phẩm"),
  thucTe: z.number().min(0, "Số lượng không âm"),
  thang: z.string().optional(),
  ghiChu: z.string().optional(),
})

export type StockCheckForm = z.infer<typeof stockCheckSchema>
