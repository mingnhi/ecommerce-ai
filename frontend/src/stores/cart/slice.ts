import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import type { CartItemMeta, GuestCartLine } from "@/apis/cart/types";
import { CART_PERSIST_KEY } from "./constants";

export interface CartState {
  guestItems: GuestCartLine[];
  cartItemMeta: Record<string, CartItemMeta>;
  serverCartId: string | null;
  serverItemCount: number;
  serverTotal: string;
}

const initialState: CartState = {
  guestItems: [],
  cartItemMeta: {},
  serverCartId: null,
  serverItemCount: 0,
  serverTotal: "0.00",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setItemMeta(
      state,
      action: PayloadAction<{ variantId: string } & CartItemMeta>,
    ) {
      const { variantId, ...meta } = action.payload;
      state.cartItemMeta[variantId] = meta;
    },
    addGuestItem(state, action: PayloadAction<GuestCartLine>) {
      const { variantId, productName, variantLabel, thumbnail, quantity, unitPriceVnd } = action.payload;

      if (!variantId || !quantity) return;

      const idx = state.guestItems.findIndex((item) => item.variantId === variantId);
      state.cartItemMeta[variantId] = { productName, variantLabel, thumbnail };

      if (idx >= 0) {
        state.guestItems[idx].quantity = Math.min(state.guestItems[idx].quantity + quantity, 999);
        state.guestItems[idx].unitPriceVnd = unitPriceVnd;
      } else {
        state.guestItems.push(action.payload);
      }
    },
    updateGuestItem(
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>,
    ) {
      const item = state.guestItems.find((line) => line.variantId === action.payload.variantId);
      if (!item) return;

      if (action.payload.quantity < 1) {
        const { variantId } = action.payload;
        state.guestItems = state.guestItems.filter((line) => line.variantId !== variantId);
        delete state.cartItemMeta[variantId];
        return;
      }

      item.quantity = action.payload.quantity;
    },
    removeGuestItem(state, action: PayloadAction<string>) {
      const variantId = action.payload;
      state.guestItems = state.guestItems.filter((item) => item.variantId !== variantId);
      delete state.cartItemMeta[variantId];
    },
    clearGuestCart(state) {
      state.guestItems = [];
      state.cartItemMeta = {};
    },
    resetServerCart(state) {
      state.serverCartId = null;
      state.serverItemCount = 0;
      state.serverTotal = "0.00";
    },
    setServerCart(
      state,
      action: PayloadAction<{ cartId: string; itemCount: number; total: string }>,
    ) {
      state.serverCartId = action.payload.cartId;
      state.serverItemCount = action.payload.itemCount;
      state.serverTotal = action.payload.total;
    },
  },
});

const persistConfig = {
  key: CART_PERSIST_KEY,
  storage,
  whitelist: ["guestItems", "cartItemMeta"],
};

export const {
  setItemMeta,
  addGuestItem,
  updateGuestItem,
  removeGuestItem,
  clearGuestCart,
  resetServerCart,
  setServerCart,
} = cartSlice.actions;

export const cartReducer = persistReducer(persistConfig, cartSlice.reducer);
export { cartSlice };
