export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatVndAxis(amount: number): string {
  if (amount >= 1_000_000_000)
    return `${Math.round(amount / 1_000_000_000)} tỷ`
  if (amount >= 1_000_000)
    return `${Math.round(amount / 1_000_000)} tr`
  if (amount >= 1_000)
    return `${Math.round(amount / 1_000)} n`
  return String(amount)
}

export function formatVndBillion(amount: number): string {
  const b = amount / 1_000_000_000
  return `${b.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ ₫`
}
