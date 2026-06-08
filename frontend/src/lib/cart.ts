import type { CartItem, CartItemMeta, CartLine, GuestCartLine } from '@/apis/cart/types';

export function formatCartLineName(meta?: CartItemMeta): string {
  if (!meta?.productName) return 'Sản phẩm';
  if (meta.variantLabel) return `${meta.productName}`;
  return meta.productName;
}

export function guestLineToCartLine(item: GuestCartLine): CartLine {
  return {
    id: item.variantId,
    productId: item.variantId,
    variantId: item.variantId,
    name: formatCartLineName(item),
    image: item.thumbnail ?? null,
    price: Number(item.unitPriceVnd ?? 0),
    quantity: item.quantity,
  };
}

export function serverItemToCartLine(item: CartItem, meta?: CartItemMeta): CartLine {
  const display: CartItemMeta = {
    productName: item.productName || meta?.productName,
    variantLabel: item.variantLabel ?? meta?.variantLabel,
    thumbnail: item.thumbnail ?? meta?.thumbnail,
  };

  return {
    id: item.id,
    productId: item.variantId,
    variantId: item.variantId,
    name: formatCartLineName(display),
    image: display.thumbnail ?? null,
    price: item.priceAtTime,
    quantity: item.quantity,
  };
}

export function sumCartQuantity(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function sumCartSubtotal(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
