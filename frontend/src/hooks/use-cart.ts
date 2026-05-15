import { useCallback } from "react";
import { cartSlice } from "@/stores/cart/slice";
import { selectCartItems, selectCartSubtotal, selectCartTotalQuantity } from "@/stores/cart/selectors";
import { useAppDispatch, useAppSelector } from "@/stores";
import type { ICartLineInput } from "@/types/cart";

export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);
  const subtotal = useAppSelector(selectCartSubtotal);

  const addLine = useCallback(
    (payload: ICartLineInput) => {
      dispatch(cartSlice.actions.addLine(payload));
    },
    [dispatch]
  );

  const removeLine = useCallback(
    (id: string) => {
      dispatch(cartSlice.actions.removeLine(id));
    },
    [dispatch]
  );

  const setLineQuantity = useCallback(
    (id: string, quantity: number) => {
      dispatch(cartSlice.actions.setLineQuantity({ id, quantity }));
    },
    [dispatch]
  );

  const clearCart = useCallback(() => {
    dispatch(cartSlice.actions.clearCart());
  }, [dispatch]);

  return {
    items,
    totalQuantity,
    subtotal,
    addLine,
    removeLine,
    setLineQuantity,
    clearCart,
  };
}
