import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import type { ICartLine, ICartLineInput } from "@/types/cart";
import { CART_PERSIST_KEY } from "./constants";

export interface GuestCartLine {
  variantId: string;
  quantity: number;
  productName?: string;
  variantLabel?: string;
  unitPriceVnd?: string;
  thumbnail?: string;
}

export interface CartState {
  items: ICartLine[];
  guestItems: GuestCartLine[];
  serverCartId: string | null;
  serverItemCount: number;
  serverTotal: string;
  isHydrated: boolean;
}

const initialState: CartState = {
  items: [],
  guestItems: [],
  serverCartId: null,
  serverItemCount: 0,
  serverTotal: "0.00",
  isHydrated: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addLine(state, action: PayloadAction<ICartLineInput>) {
      const { productId, quantity, ...rest } = action.payload;
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ id: productId, productId, quantity, ...rest });
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
    hydrateGuestCart(state, action: PayloadAction<GuestCartLine[]>) {
      state.guestItems = action.payload;
      state.isHydrated = true;
    },
    addGuestItem(state, action: PayloadAction<GuestCartLine>) {
      const idx = state.guestItems.findIndex((i) => i.variantId === action.payload.variantId);
      if (idx >= 0) {
        state.guestItems[idx].quantity = Math.min(
          state.guestItems[idx].quantity + action.payload.quantity,
          999
        );
      } else {
        state.guestItems.push(action.payload);
      }
    },
    updateGuestItem(state, action: PayloadAction<{ variantId: string; quantity: number }>) {
      const item = state.guestItems.find((i) => i.variantId === action.payload.variantId);
      if (item) item.quantity = action.payload.quantity;
    },
    removeGuestItem(state, action: PayloadAction<string>) {
      state.guestItems = state.guestItems.filter((i) => i.variantId !== action.payload);
    },
    clearGuestCart(state) {
      state.guestItems = [];
    },
    setServerCart(
      state,
      action: PayloadAction<{ cartId: string; itemCount: number; total: string }>
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
  whitelist: ["items", "guestItems"],
};

export const {
  hydrateGuestCart,
  addGuestItem,
  updateGuestItem,
  removeGuestItem,
  clearGuestCart,
  setServerCart,
} = cartSlice.actions;

export const cartReducer = persistReducer(persistConfig, cartSlice.reducer);
export { cartSlice };
