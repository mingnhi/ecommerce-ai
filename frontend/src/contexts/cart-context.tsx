"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { store, useAppDispatch, useAppSelector } from "@/stores";
import { selectIsAuthenticated } from "@/stores/auth/selectors";
import {
  addGuestItem,
  clearGuestCart,
  removeGuestItem,
  resetServerCart,
  setItemMeta,
  setServerCart,
  updateGuestItem,
} from "@/stores/cart/slice";
import type { AddToCartPayload, Cart, CartLine, GuestCartLine } from "@/apis/cart/types";
import { selectGuestItems } from "@/stores/cart/selectors";
import {
  guestLineToCartLine,
  serverItemToCartLine,
  sumCartQuantity,
  sumCartSubtotal,
} from "@/lib/cart";
import { useCartQuery } from "@/apis/cart/queries";
import { CartService } from "@/apis/cart/requests";
import { KEYS as CART_KEYS } from "@/apis/cart/keys";
import { isApiSuccess } from "@/lib/api-response";

interface CartContextValue {
  items: CartLine[];
  totalQuantity: number;
  subtotal: number;
  isLoading: boolean;
  serverCart: Cart | null;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  removeLine: (id: string) => Promise<void>;
  setLineQuantity: (id: string, quantity: number) => Promise<void>;
  mergeGuestCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mergeAttemptedRef = useRef(false);
  const [isMerging, setIsMerging] = useState(false);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const guestItems = useAppSelector(selectGuestItems);

  const hasPendingMerge = isAuthenticated && guestItems.length > 0 && !mergeAttemptedRef.current;

  const { data: serverCartResponse, isLoading } = useCartQuery({
    enabled: isAuthenticated && !hasPendingMerge && !isMerging,
  });

  const serverCart = useMemo(() => {
    if (!isApiSuccess(serverCartResponse)) return null;
    return serverCartResponse.data ?? null;
  }, [serverCartResponse]);

  const items = useMemo(() => {
    if (isAuthenticated && serverCart?.items?.length) {
      return serverCart.items.map((item) => serverItemToCartLine(item));
    }
    return guestItems.map(guestLineToCartLine);
  }, [isAuthenticated, serverCart, guestItems]);

  const totalQuantity = useMemo(() => sumCartQuantity(items), [items]);
  const subtotal = useMemo(() => sumCartSubtotal(items), [items]);

  useEffect(() => {
    if (!isAuthenticated) {
      mergeAttemptedRef.current = false;
      return;
    }

    if (!serverCart) return;

    dispatch(
      setServerCart({
        cartId: serverCart.id,
        itemCount: serverCart.itemCount,
        total: String(serverCart.total),
      }),
    );
  }, [isAuthenticated, serverCart, dispatch]);

  const mergeGuestCart = useCallback(async () => {
    if (isMerging) return;
    
    const authenticated = selectIsAuthenticated(store.getState());
    const currentGuestItems = selectGuestItems(store.getState());

    if (!authenticated || currentGuestItems.length === 0) {
      return;
    }

    setIsMerging(true);

    try {
      const mergePayload = {
        items: currentGuestItems.map((item: GuestCartLine) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const response = await CartService.merge(mergePayload);

      if (!isApiSuccess(response) || !response.data) {
        throw new Error('Merge failed');
      }

      dispatch(clearGuestCart());
      dispatch(
        setServerCart({
          cartId: response.data.id,
          itemCount: response.data.itemCount,
          total: String(response.data.total),
        }),
      );
      queryClient.setQueryData([CART_KEYS.CART], response);
    } finally {
      setIsMerging(false);
    }
  }, [dispatch, queryClient, isMerging]);

  useEffect(() => {
    if (!hasPendingMerge || isMerging) return;

    mergeAttemptedRef.current = true;

    void mergeGuestCart()
      .catch(() => {
        mergeAttemptedRef.current = false;
      })
      .finally(() => {
        void queryClient.invalidateQueries({ queryKey: [CART_KEYS.CART] });
      });
  }, [hasPendingMerge, mergeGuestCart, queryClient, isMerging]);

  const addToCart = useCallback(
    async (payload: AddToCartPayload) => {
      const { variantId, quantity, productName, variantLabel, unitPrice, thumbnail } = payload;
      const authenticated = selectIsAuthenticated(store.getState());

      if (!authenticated) {
        const guestPayload = {
          variantId,
          quantity,
          productName,
          variantLabel,
          unitPriceVnd: String(unitPrice),
          thumbnail,
        };
        
        dispatch(addGuestItem(guestPayload));
        return;
      }

      dispatch(
        setItemMeta({
          variantId,
          productName,
          variantLabel,
          thumbnail,
        }),
      );

      const response = await CartService.addItem({ variantId, quantity });
      if (isApiSuccess(response) && response.data) {
        queryClient.setQueryData([CART_KEYS.CART], response);
        dispatch(
          setServerCart({
            cartId: response.data.id,
            itemCount: response.data.itemCount,
            total: String(response.data.total),
          }),
        );
      }
    },
    [dispatch, queryClient],
  );

  const removeLine = useCallback(
    async (id: string) => {
      const authenticated = selectIsAuthenticated(store.getState());

      if (!authenticated) {
        dispatch(removeGuestItem(id));
        return;
      }

      const response = await CartService.removeItem(id);
      if (isApiSuccess(response) && response.data) {
        queryClient.setQueryData([CART_KEYS.CART], response);
        dispatch(
          setServerCart({
            cartId: response.data.id,
            itemCount: response.data.itemCount,
            total: String(response.data.total),
          }),
        );
      }
    },
    [dispatch, queryClient],
  );

  const setLineQuantity = useCallback(
    async (id: string, quantity: number) => {
      const authenticated = selectIsAuthenticated(store.getState());

      if (!authenticated) {
        dispatch(updateGuestItem({ variantId: id, quantity }));
        return;
      }

      if (quantity < 1) {
        await removeLine(id);
        return;
      }

      const response = await CartService.updateItem(id, { quantity });
      if (isApiSuccess(response) && response.data) {
        queryClient.setQueryData([CART_KEYS.CART], response);
        dispatch(
          setServerCart({
            cartId: response.data.id,
            itemCount: response.data.itemCount,
            total: String(response.data.total),
          }),
        );
      }
    },
    [dispatch, queryClient, removeLine],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalQuantity,
      subtotal,
      isLoading,
      serverCart,
      addToCart,
      removeLine,
      setLineQuantity,
      mergeGuestCart,
    }),
    [
      items,
      totalQuantity,
      subtotal,
      isLoading,
      serverCart,
      addToCart,
      removeLine,
      setLineQuantity,
      mergeGuestCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
}
