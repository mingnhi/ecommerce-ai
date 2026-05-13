import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GuestCartLine {
  variantId: string;
  quantity: number;
  productName?: string;
  variantLabel?: string;
  unitPriceVnd?: string;
  thumbnail?: string;
}

interface CartState {
  // Guest cart — lưu localStorage qua reducer chính (sync trong layout/provider)
  guestItems: GuestCartLine[];
  serverCartId: string | null;
  serverItemCount: number;
  serverTotal: string;
  isHydrated: boolean;
}

const initialState: CartState = {
  guestItems: [],
  serverCartId: null,
  serverItemCount: 0,
  serverTotal: '0.00',
  isHydrated: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateGuestCart: (state, action: PayloadAction<GuestCartLine[]>) => {
      state.guestItems = action.payload;
      state.isHydrated = true;
    },
    addGuestItem: (state, action: PayloadAction<GuestCartLine>) => {
      const idx = state.guestItems.findIndex((i) => i.variantId === action.payload.variantId);
      if (idx >= 0) {
        state.guestItems[idx].quantity = Math.min(
          state.guestItems[idx].quantity + action.payload.quantity,
          999,
        );
      } else {
        state.guestItems.push(action.payload);
      }
    },
    updateGuestItem: (state, action: PayloadAction<{ variantId: string; quantity: number }>) => {
      const item = state.guestItems.find((i) => i.variantId === action.payload.variantId);
      if (item) item.quantity = action.payload.quantity;
    },
    removeGuestItem: (state, action: PayloadAction<string>) => {
      state.guestItems = state.guestItems.filter((i) => i.variantId !== action.payload);
    },
    clearGuestCart: (state) => {
      state.guestItems = [];
    },
    setServerCart: (
      state,
      action: PayloadAction<{ cartId: string; itemCount: number; total: string }>,
    ) => {
      state.serverCartId = action.payload.cartId;
      state.serverItemCount = action.payload.itemCount;
      state.serverTotal = action.payload.total;
    },
  },
});

export const {
  hydrateGuestCart,
  addGuestItem,
  updateGuestItem,
  removeGuestItem,
  clearGuestCart,
  setServerCart,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;

// localStorage key
export const CART_STORAGE_KEY = 'guest_cart_v1';
