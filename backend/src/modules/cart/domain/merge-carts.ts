export interface CartLine {
  variantId: string;
  quantity: number;
  priceAtTime?: number;
}

export interface MergeOptions {
  maxQuantity: number;
}

/**
 * Merge guest cart lines into server cart lines. For each variant:
 *   - if exists on both → sum quantities, capped at maxQuantity
 *   - if guest-only → take guest, cap at maxQuantity
 *   - if server-only → keep server unchanged
 *
 * Server lines that are unchanged keep their `priceAtTime`. Lines coming from
 * guest get `priceAtTime: undefined` so caller can resolve current price.
 */
export function mergeCarts(
  serverLines: CartLine[],
  guestLines: CartLine[],
  options: MergeOptions,
): CartLine[] {
  const byVariant = new Map<string, CartLine>();

  for (const line of serverLines) {
    byVariant.set(line.variantId, { ...line });
  }

  for (const guest of guestLines) {
    if (guest.quantity <= 0) continue;
    const existing = byVariant.get(guest.variantId);
    if (existing) {
      const total = Math.min(
        existing.quantity + guest.quantity,
        options.maxQuantity,
      );
      byVariant.set(guest.variantId, { ...existing, quantity: total });
    } else {
      const capped = Math.min(guest.quantity, options.maxQuantity);
      byVariant.set(guest.variantId, {
        variantId: guest.variantId,
        quantity: capped,
      });
    }
  }

  return Array.from(byVariant.values());
}
