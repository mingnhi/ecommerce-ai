import type { RootState } from '@/stores';

export const selectSuppressHeader = (state: RootState) => state.layout.suppressHeader;
