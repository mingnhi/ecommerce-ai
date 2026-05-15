import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  /** Tập productId đã favorite. Lưu cache để tô heart icon ngay không cần refetch. */
  productIds: string[];
  loaded: boolean;
}

const initialState: WishlistState = {
  productIds: [],
  loaded: false,
};

const slice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setIds(state, action: PayloadAction<string[]>) {
      state.productIds = action.payload;
      state.loaded = true;
    },
    addId(state, action: PayloadAction<string>) {
      if (!state.productIds.includes(action.payload)) {
        state.productIds.push(action.payload);
      }
    },
    removeId(state, action: PayloadAction<string>) {
      state.productIds = state.productIds.filter((id) => id !== action.payload);
    },
    clear(state) {
      state.productIds = [];
      state.loaded = false;
    },
  },
});

export const wishlistReducer = slice.reducer;
export const {
  setIds: setWishlistIds,
  addId: addWishlistId,
  removeId: removeWishlistId,
  clear: clearWishlist,
} = slice.actions;
