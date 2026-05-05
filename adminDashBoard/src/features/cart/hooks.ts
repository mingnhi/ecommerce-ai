import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/services/http';
import type {
  CartResponse,
  AddToCartRequest,
  UpdateQuantityRequest
} from './types';

// API functions
export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const response = await httpClient.get('/api/cart');
    return response.data;
  },

  addToCart: async (request: AddToCartRequest): Promise<void> => {
    await httpClient.post('/api/cart/add', request);
  },

  removeFromCart: async (itemId: string): Promise<void> => {
    await httpClient.delete(`/api/cart/${itemId}`);
  },

  updateQuantity: async (request: UpdateQuantityRequest): Promise<void> => {
    await httpClient.put('/api/cart/quantity', request);
  },

  clearCart: async (): Promise<void> => {
    await httpClient.delete('/api/cart');
  },
};

// Custom hooks for API calls
export const useCartQuery = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateQuantity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cartApi.updateQuantity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};