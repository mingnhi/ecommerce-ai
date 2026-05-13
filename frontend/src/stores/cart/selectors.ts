import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/stores";
import type { ICartLine } from "@/types/cart";

export const selectCartItems = (state: RootState): ICartLine[] => state.cart.items;

export const selectCartTotalQuantity = createSelector(selectCartItems, (items: ICartLine[]) =>
  items.reduce((sum: number, i: ICartLine) => sum + i.quantity, 0)
);

export const selectCartSubtotal = createSelector(selectCartItems, (items: ICartLine[]) =>
  items.reduce((sum: number, i: ICartLine) => sum + i.price * i.quantity, 0)
);
