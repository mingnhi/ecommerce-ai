import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import productService from "@/services/product";

import type { ProductFormValues } from "../types/product.type";

/**
 * GET ALL PRODUCTS
 */
export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: ["products", params],

    queryFn: () =>
      productService.getAll(params),

    staleTime: 1000 * 30,

    gcTime: 1000 * 60 * 5,

    refetchOnMount: true,

    refetchOnWindowFocus: false,
  });
};

/**
 * GET PRODUCT BY SLUG
 */
export const useProductBySlug = (
  slug: string
) => {
  return useQuery({
    queryKey: ["product", slug],

    queryFn: () =>
      productService.getBySlug(slug),

    enabled: !!slug,
  });
};

/**
 * CREATE PRODUCT
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: ProductFormValues
    ) => productService.create(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

/**
 * UPDATE PRODUCT
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ProductFormValues>;
    }) =>
      productService.update(id, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

/**
 * DELETE PRODUCT
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      productService.delete(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

/**
 * UPLOAD IMAGE
 */
export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      file,
      type,
      sortOrder,
    }: any) =>
      productService.uploadImage(
        productId,
        file,
        type,
        sortOrder
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

/**
 * DELETE IMAGE
 */
export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) =>
      productService.deleteImage(imageId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

/**
 * SET THUMBNAIL
 */
export const useSetProductThumbnail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) =>
      productService.setThumbnail(imageId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};