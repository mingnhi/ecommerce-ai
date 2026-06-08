import { useCallback } from "react";
import { useCartContext } from "@/contexts";

export function useCart() {
  const {
    items,
    totalQuantity,
    subtotal,
    addToCart,
    removeLine,
    setLineQuantity,
  } = useCartContext();

  const addLine = useCallback(
    async (payload: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image?: string | null;
    }) => {
      await addToCart({
        variantId: payload.productId,
        quantity: payload.quantity,
        productName: payload.name,
        unitPrice: payload.price,
        thumbnail: payload.image ?? undefined,
      });
    },
    [addToCart],
  );

  return {
    items,
    totalQuantity,
    subtotal,
    addLine,
    removeLine,
    setLineQuantity,
  };
}
