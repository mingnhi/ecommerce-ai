import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/services/http";
import type {
  AddToCartRequest,
  CartResponse,
  UpdateQuantityRequest,
} from "./types";

const CART_KEY = ["cart"] as const;

export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const response = await httpClient.get("/api/cart");
    return response.data;
  },

  addToCart: async (request: AddToCartRequest): Promise<void> => {
    await httpClient.post("/api/cart/add", request);
  },

  removeFromCart: async (itemId: string): Promise<void> => {
    await httpClient.delete(`/api/cart/${itemId}`);
  },

  updateQuantity: async (request: UpdateQuantityRequest): Promise<void> => {
    await httpClient.put("/api/cart/quantity", request);
  },

  clearCart: async (): Promise<void> => {
    await httpClient.delete("/api/cart");
  },
};

export const useCartQuery = () => {
  return useQuery({
    queryKey: CART_KEY,
    queryFn: cartApi.getCart,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });
};

export const useUpdateQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.updateQuantity,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });
};
