import { formatVnd } from "@/lib/format-currency";

export interface MockVoucher {
  id: string;
  discountAmount: number;
  minOrderAmount: number;
  tag: string;
  expiryLabel: string;
  stock: number;
}

export const MOCK_VOUCHERS: MockVoucher[] = [
  {
    id: "v-125k",
    discountAmount: 125_000,
    minOrderAmount: 200_000,
    tag: "Sản phẩm nhất định",
    expiryLabel: "31.05.2026",
    stock: 5,
  },
  {
    id: "v-50k",
    discountAmount: 50_000,
    minOrderAmount: 0,
    tag: "Toàn shop",
    expiryLabel: "15.06.2026",
    stock: 12,
  },
  {
    id: "v-500k",
    discountAmount: 500_000,
    minOrderAmount: 5_000_000,
    tag: "Điện thoại",
    expiryLabel: "01.07.2026",
    stock: 2,
  },
  {
    id: "v-15pct",
    discountAmount: 300_000,
    minOrderAmount: 1_500_000,
    tag: "Tối đa 300k",
    expiryLabel: "20.05.2026",
    stock: 8,
  },
  {
    id: "v-freeship",
    discountAmount: 30_000,
    minOrderAmount: 99_000,
    tag: "Vận chuyển",
    expiryLabel: "30.04.2026",
    stock: 20,
  },
];

export function formatVoucherDiscount(amount: number) {
  return `Giảm ${formatVnd(amount)}`;
}

export function formatVoucherMinOrder(amount: number) {
  if (amount <= 0) return "Đơn tối thiểu 0đ";
  return `Đơn tối thiểu ${formatVnd(amount)}`;
}
