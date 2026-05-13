export interface CartLine {
  variantId: string;
  quantity: number;
  priceAtTime?: string;
}

export interface MergeOptions {
  /** Cap số lượng mỗi line. Default 999 (khớp DTO). */
  maxQuantity?: number;
}

const DEFAULT_MAX_QTY = 999;

/**
 * Pure function — merge guest cart (localStorage) vào server cart khi user login.
 *
 * Quy tắc:
 *  - Nếu variantId đã có trong server: cộng quantity, cap ở maxQuantity
 *  - Nếu variantId chỉ có ở guest: append vào cuối, giữ priceAtTime của guest (nếu có)
 *  - Server cart line không được động — chỉ tăng quantity
 *  - Thứ tự: giữ thứ tự server, sau đó append guest items mới ở cuối
 *  - Immutable: không mutate input arrays
 *
 * KHÔNG validate stock — đó là việc của caller (cần I/O).
 */
export function mergeCarts(
  server: ReadonlyArray<CartLine>,
  guest: ReadonlyArray<CartLine>,
  options: MergeOptions = {},
): CartLine[] {
  const max = options.maxQuantity ?? DEFAULT_MAX_QTY;

  const result: CartLine[] = server.map((s) => ({ ...s }));
  const indexByVariant = new Map<string, number>();
  result.forEach((line, idx) => indexByVariant.set(line.variantId, idx));

  for (const g of guest) {
    if (g.quantity <= 0) continue;
    const idx = indexByVariant.get(g.variantId);
    if (idx !== undefined) {
      const merged = result[idx].quantity + g.quantity;
      result[idx] = { ...result[idx], quantity: Math.min(merged, max) };
    } else {
      result.push({
        variantId: g.variantId,
        quantity: Math.min(g.quantity, max),
        priceAtTime: g.priceAtTime,
      });
      indexByVariant.set(g.variantId, result.length - 1);
    }
  }

  return result;
}

/**
 * Tính tổng tiền real-time cho cart, dùng giá lookup từ caller.
 * Pure — caller resolve giá từ DB rồi truyền vào map.
 */
export function calculateCartTotal(
  lines: ReadonlyArray<CartLine>,
  priceByVariant: ReadonlyMap<string, number>,
): number {
  let total = 0;
  for (const l of lines) {
    const price = priceByVariant.get(l.variantId);
    if (price === undefined) continue;
    total += price * l.quantity;
  }
  return total;
}
