import type { RootState } from '@/stores';
import type { GuestCartLine } from './slice';

export const selectGuestItems = (s: RootState): GuestCartLine[] => s.cart.guestItems;

export const selectGuestItemCount = (s: RootState): number =>
  s.cart.guestItems.reduce((n: number, i: GuestCartLine) => n + i.quantity, 0);

export const selectGuestTotal = (s: RootState): string =>
  s.cart.guestItems
    .reduce(
      (sum: number, i: GuestCartLine) => sum + Number(i.unitPriceVnd ?? 0) * i.quantity,
      0,
    )
    .toFixed(2);

export const selectServerCartId = (s: RootState): string | null => s.cart.serverCartId;
export const selectServerItemCount = (s: RootState): number => s.cart.serverItemCount;
export const selectServerTotal = (s: RootState): string => s.cart.serverTotal;
