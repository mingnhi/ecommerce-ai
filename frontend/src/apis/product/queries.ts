import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService } from './requests';
import { KEYS } from './keys';
import type {
  ProductListResponse,
  ProductPriceRangeResponse,
  QueryProductRequest,
  CreateReviewRequest,
  UpdateReviewRequest,
  ProductReviewsResponse,
} from './types';

export const useProductPriceRange = () => {
  return useQuery<ProductPriceRangeResponse>({
    queryKey: [KEYS.PRICE_RANGE],
    queryFn: () => ProductService.getPriceRange(),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
};

export const useProducts = (query: QueryProductRequest = {}) => {
  return useQuery<ProductListResponse>({
    queryKey: [KEYS.PRODUCTS, query],
    queryFn: () => ProductService.getAll(query),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: [KEYS.PRODUCT_DETAIL, slug],
    queryFn: () => ProductService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
};

/** ====================== REVIEW QUERIES ====================== */

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: () => ProductService.getReviews(productId),
    enabled: !!productId,
    staleTime: 60_000,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: CreateReviewRequest }) =>
      ProductService.createReview(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: [KEYS.PRODUCT_DETAIL, productId] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      productId, 
      reviewId, 
      data 
    }: { 
      productId: string; 
      reviewId: string; 
      data: UpdateReviewRequest 
    }) => ProductService.updateReview(productId, reviewId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reviewId }: { productId: string; reviewId: string }) =>
      ProductService.deleteReview(productId, reviewId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
  });
};