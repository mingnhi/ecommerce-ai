import { httpClient } from "./http";

import type {
  Product,
  ProductFormValues,
  ProductImage,
  ProductListItem,
} from "../features/products/types/product.type";

const normalizeImage = (image: any): ProductImage => ({
  id: String(image.id),

  imageUrl: image.imageUrl || "",

  type: image.type || "GALLERY",

  sortOrder: image.sortOrder || 0,

  isPrimary: image.isPrimary || false,

  createdAt: image.createdAt,
});

const normalizeProduct = (
  product: any
): Product => ({
  id: String(product.id),

  name: product.name,

  slug: product.slug,

  shortDescription:
    product.shortDescription || "",

  description:
    product.description || "",

  thumbnail:
    product.thumbnail ||
    product.images?.find(
      (img: any) => img.isPrimary
    )?.imageUrl ||
    "",

  isActive:
    product.isActive ?? true,

  createdAt: product.createdAt,

  updatedAt: product.updatedAt,

  category: {
    id: String(
      product.category?.id || ""
    ),

    name:
      product.category?.name || "",

    slug:
      product.category?.slug || "",
  },

  prices: product.prices || [],

  variants:
    product.variants || [],

  attributes:
    product.attributes || [],

  images:
    product.images?.map(
      normalizeImage
    ) || [],

  reviewSummary:
    product.reviewSummary || {
      averageRating: 0,
      totalReviews: 0,
    },
});

const normalizeProductList = (
  product: any
): ProductListItem => ({
  id: String(product.id),

  name: product.name,

  slug: product.slug,

  shortDescription:
    product.shortDescription || "",

  thumbnail:
    product.thumbnail ||
    product.images?.find(
      (img: any) => img.isPrimary
    )?.imageUrl ||
    "",

  isActive:
    product.isActive ?? true,

  createdAt: product.createdAt,

  category: {
    id: String(
      product.category?.id || ""
    ),

    name:
      product.category?.name || "",

    slug:
      product.category?.slug || "",
  },

  price:
    product.price ||
    product.prices?.find(
      (p: any) => p.isActive
    ) ||
    product.prices?.[0] ||
    null,
});

export const productService = {
  /**
   * GET ALL PRODUCTS
   */
  getAll: async (params?: any) => {
    const res = await httpClient.get(
      "/products",
      {
        params,
      }
    );

    console.log(
      "PRODUCTS API:",
      res.data
    );

    return {
      // FIX RESPONSE STRUCTURE
      products: (
        res.data?.data?.data
          ?.products || []
      ).map(normalizeProductList),

      meta:
        res.data?.data?.meta ||
        {},
    };
  },

  /**
   * GET PRODUCT BY SLUG
   */
  getBySlug: async (
    slug: string
  ) => {
    const res = await httpClient.get(
      `/products/${slug}`
    );

    return {
      // FIX RESPONSE STRUCTURE
      product: normalizeProduct(
        res.data?.data?.data
          ?.product
      ),
    };
  },

  /**
   * CREATE PRODUCT
   */
  create: async (
    payload: ProductFormValues
  ) => {
    const body = {
      categoryId:
        payload.categoryId,

      name: payload.name,

      shortDescription:
        payload.shortDescription,

      description:
        payload.description,

      isActive:
        payload.isActive,

      prices: payload.prices,

      variants:
        payload.variants,

      attributes:
        payload.attributes,
    };

    const res =
      await httpClient.post(
        "/products",
        body
      );

    return res.data;
  },

  /**
   * UPDATE PRODUCT
   */
  update: async (
    id: string,
    payload: Partial<ProductFormValues>
  ) => {
    const body = {
      categoryId:
        payload.categoryId,

      name: payload.name,

      shortDescription:
        payload.shortDescription,

      description:
        payload.description,

      isActive:
        payload.isActive,

      prices: payload.prices,

      variants:
        payload.variants,

      attributes:
        payload.attributes,
    };

    const res =
      await httpClient.put(
        `/products/${id}`,
        body
      );

    return res.data;
  },

  /**
   * DELETE PRODUCT
   */
  delete: async (id: string) =>
    await httpClient.delete(
      `/products/${id}`
    ),

  /**
   * UPLOAD IMAGE
   */
  uploadImage: async (
    productId: string,
    file: File,
    type:
      | "THUMBNAIL"
      | "GALLERY" = "GALLERY",
    sortOrder: number = 0
  ) => {
    const formData =
      new FormData();

    formData.append("file", file);

    formData.append("type", type);

    formData.append(
      "sortOrder",
      String(sortOrder)
    );

    const res =
      await httpClient.post(
        `/products/${productId}/images`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return res.data;
  },

  /**
   * SET THUMBNAIL
   */
  setThumbnail: async (
    imageId: string
  ) =>
    await httpClient.patch(
      `/images/${imageId}/thumbnail`
    ),

  /**
   * DELETE IMAGE
   */
  deleteImage: async (
    imageId: string
  ) =>
    await httpClient.delete(
      `/images/${imageId}`
    ),
};

export default productService;