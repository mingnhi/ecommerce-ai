'use client';

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/stores';
import {
  setWishlistIds,
  addWishlistId,
  removeWishlistId,
  clearWishlist,
} from '@/stores/wishlist/slice';
import { wishlistApi } from '@/apis/wishlist';

/** Fetch wishlist IDs 1 lần khi user login. Gọi từ root layout / providers. */
export function useWishlistBootstrap() {
  const dispatch = useAppDispatch();
  const { status } = useSession();
  const loaded = useAppSelector((s) => s.wishlist.loaded);

  useEffect(() => {
    if (status === 'authenticated' && !loaded) {
      wishlistApi
        .listIds()
        .then((ids) => dispatch(setWishlistIds(ids)))
        .catch(() => {});
    }
    if (status === 'unauthenticated') {
      dispatch(clearWishlist());
    }
  }, [status, loaded, dispatch]);
}

/** Toggle 1 sản phẩm — trả isFav + toggle. */
export function useWishlistButton(productId: string) {
  const dispatch = useAppDispatch();
  const { status } = useSession();
  const isFav = useAppSelector((s) => s.wishlist.productIds.includes(productId));

  const toggle = useCallback(async () => {
    if (status !== 'authenticated') {
      toast.info('Vui lòng đăng nhập để dùng yêu thích');
      return;
    }
    try {
      if (isFav) {
        await wishlistApi.remove(productId);
        dispatch(removeWishlistId(productId));
        toast.success('Đã bỏ khỏi yêu thích');
      } else {
        await wishlistApi.add(productId);
        dispatch(addWishlistId(productId));
        toast.success('Đã thêm vào yêu thích');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? 'Lỗi');
    }
  }, [isFav, productId, status, dispatch]);

  return { isFav, toggle, canUse: status === 'authenticated' };
}
