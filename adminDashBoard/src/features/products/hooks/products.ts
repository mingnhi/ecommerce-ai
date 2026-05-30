import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import productService from "@/services/product";
import type {
  ProductFormValues,
  ProductImageType,
  ProductListQuery,
} from "../types/product.type";

export const useProducts = (params?: ProductListQuery) =>
  useQuery({
    queryKey: [
      "products",
      params?.search ?? "",
      params?.categoryId ?? "",
      params?.sort ?? "",
      params?.limit ?? 50,
    ],
    queryFn: () => productService.getAll(params),
  });

/**
 * GET PRODUCT DETAIL
 */
export const useProductBySlug = (slug: string) =>
  useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getBySlug(slug),
    enabled: !!slug,
  });

/**
 * CREATE PRODUCT
 */
export const useCreateProduct = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductFormValues) =>
      productService.create(payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

/**
 * UPDATE PRODUCT
 */
export const useUpdateProduct = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ProductFormValues>;
    }) => productService.update(id, payload),

    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["products"] });

      const slug = data?.data?.product?.slug;

      if (slug) {
        qc.invalidateQueries({ queryKey: ["product", slug] });
      } else {
        qc.invalidateQueries({
          predicate: (q) => q.queryKey[0] === "product",
        });
      }
    },
  });
};

/**
 * DELETE PRODUCT
 */
export const useDeleteProduct = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });

      qc.removeQueries({
        predicate: (q) => q.queryKey[0] === "product",
      });
    },
  });
};

/**
 * UPLOAD IMAGE
 */
export const useUploadProductImage = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      files,
      type,
      sortOrder,
    }: {
      productId: string;
      files: File[];
      type?: ProductImageType;
      sortOrder?: number;
    }) =>
      productService.uploadImage(productId, files, type, sortOrder),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });

      qc.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "product",
      });
    },
  });
};

/**
 * DELETE IMAGE
 */
export const useDeleteProductImage = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) =>
      productService.deleteImage(imageId),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });

      qc.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "product",
      });
    },
  });
};

/**
 * SET THUMBNAIL
 */
export const useSetProductThumbnail = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) =>
      productService.setThumbnail(imageId),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });

      qc.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "product",
      });
    },
  });
};