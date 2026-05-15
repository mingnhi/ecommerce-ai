import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LayoutState {
  suppressHeader: boolean;
}

const initialState: LayoutState = {
  suppressHeader: false,
};

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setSuppressHeader: (state, action: PayloadAction<boolean>) => {
      state.suppressHeader = action.payload;
    },
  },
});

export const { setSuppressHeader } = layoutSlice.actions;
export const layoutReducer = layoutSlice.reducer;
