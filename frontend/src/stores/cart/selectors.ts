import type { RootState } from '@/stores';

export const selectGuestItems = (state: RootState) => state.cart.guestItems ?? [];
export const selectCartItemMeta = (state: RootState) => state.cart.cartItemMeta ?? {};
export const selectServerCartId = (state: RootState) => state.cart.serverCartId;
