import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import type { ICartLine, ICartLineInput } from "@/types/cart";
import { CART_PERSIST_KEY } from "./constants";

export interface CartState {
  items: ICartLine[];
}

const initialState: CartState = {
  items: [],
};

function lineId(productId: string, variantLabel?: string) {
  return `${productId}__${variantLabel ?? ""}`;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addLine(state, action: PayloadAction<ICartLineInput>) {
      const { productId, variantLabel, quantity, ...rest } = action.payload;
      const id = lineId(productId, variantLabel);
      const existing = state.items.find((i) => i.id === id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ id, productId, variantLabel, quantity, ...rest });
      }
    },
    removeLine(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    setLineQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      const line = state.items.find((i) => i.id === id);
      if (!line) return;
      if (quantity < 1) {
        state.items = state.items.filter((i) => i.id !== id);
      } else {
        line.quantity = quantity;
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

const persistConfig = {
  key: CART_PERSIST_KEY,
  storage,
  whitelist: ["items"],
};

export const cartReducer = persistReducer(persistConfig, cartSlice.reducer);
export { cartSlice };
