// src/services/product.ts

import { httpClient } from "./http";
import type {
  Product,
  ProductFormValues,
  ProductImage,
  ProductListItem,
  ProductImageType,
} from "../features/products/types/product.type";

/**
 * NORMALIZE IMAGE
 */
const normalizeImage = (image: any): ProductImage => ({
  id: String(image.id),
  imageUrl: image.imageUrl || image.image_url || "",
  publicId: image.publicId || image.public_id || "",
  type: image.type || "GALLERY",
  sortOrder: image.sortOrder ?? image.sort_order ?? 0,
  isPrimary: Boolean(image.isPrimary ?? image.is_primary),
  createdAt: image.createdAt || image.created_at,
});

/**
 * REMOVE UI-ONLY FIELDS BEFORE SEND TO BE
 */
const normalizePayload = (payload: Partial<ProductFormValues>) => ({
  categoryId: payload.categoryId,
  name: payload.name,
  shortDescription: payload.shortDescription,
  description: payload.description,
  isActive: payload.isActive,

  prices: (payload.prices ?? []).map((p) => ({
    originalPrice: Number(p.originalPrice),
    discountPercent:
      p.discountPercent !== undefined
        ? Number(p.discountPercent)
        : undefined,
    currency: p.currency || "VND",
    isActive: p.isActive ?? true,
    startAt: p.startAt,
    endAt: p.endAt,
  })),

  variants: (payload.variants ?? []).map((v) => ({
    title: v.title,
    sku: v.sku,
    stock: Number(v.stock ?? 0),
    price: v.price !== undefined ? Number(v.price) : undefined,
    image: v.image,
    isActive: v.isActive ?? true,
    attributes: v.attributes || {},
  })),

  attributes: (payload.attributes ?? []).map((a) => ({
    name: a.name,
    value: a.value,
  })),
});

/**
 * PRODUCT SERVICE
 */
export const productService = {
  /**
   * GET ALL PRODUCTS
   */
  getAll: async (params?: any) => {
    const res = await httpClient.get("/products", { params });
    console.log("res", res.data.data?.data?.products);
    const products = (res.data.data?.data?.products || []).map((p: any) => ({
      id: String(p.id),
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription || "",
      thumbnail: p.thumbnail || null,
      isActive: Boolean(p.isActive),
      createdAt: p.createdAt,

      category: {
        id: String(p.category?.id || ""),
        name: p.category?.name || "",
        slug: p.category?.slug || "",
      },

      /**
       * BE returns single price object in list view
       */
      price: p.price
        ? {
            originalPrice: Number(p.price.originalPrice),
            discountPercent:
              p.price.discountPercent !== undefined
                ? Number(p.price.discountPercent)
                : undefined,
            price: Number(p.price.price),
            currency: p.price.currency || "VND",
          }
        : null,
    })) as ProductListItem[];
    console.log("pro",products);

    return {
      products,
      meta: res.data?.meta || {},
    };
  },

  /**
   * GET PRODUCT DETAIL BY SLUG
   */
  getBySlug: async (slug: string) => {
    const res = await httpClient.get(`/products/${slug}`);
    const p = res.data?.data?.product;

    return {
      product: {
        id: String(p.id),
        name: p.name,
        slug: p.slug,

        shortDescription: p.shortDescription || "",
        description: p.description || "",

        thumbnail: p.thumbnail || null,

        isActive: Boolean(p.isActive),

        createdAt: p.createdAt,
        updatedAt: p.updatedAt,

        category: {
          id: String(p.category?.id || ""),
          name: p.category?.name || "",
          slug: p.category?.slug || "",
        },

        prices: (p.prices || []).map((price: any) => ({
          id: String(price.id),
          originalPrice: Number(price.originalPrice),
          discountPercent:
            price.discountPercent !== undefined
              ? Number(price.discountPercent)
              : undefined,
          price: Number(price.price),
          currency: price.currency || "VND",
          isActive: Boolean(price.isActive),
          startAt: price.startAt,
          endAt: price.endAt,
        })),

        variants: (p.variants || []).map((v: any) => ({
          id: String(v.id),
          title: v.title,
          sku: v.sku,
          stock: Number(v.stock ?? 0),
          price: v.price !== undefined ? Number(v.price) : undefined,
          image: v.image,
          isActive: Boolean(v.isActive),
          attributes: v.attributes || {},
        })),

        attributes: (p.attributes || []).map((a: any) => ({
          id: String(a.id),
          name: a.name,
          value: a.value,
        })),

        images: (p.images || []).map(normalizeImage),

        reviewSummary: p.reviewSummary
          ? {
              averageRating: Number(p.reviewSummary.averageRating),
              totalReviews: Number(p.reviewSummary.totalReviews),
            }
          : null,
      } as Product,
    };
  },

  /**
   * CREATE PRODUCT
   */
  create: async (payload: ProductFormValues) => {
    console.log("payload", payload);
    const res = await httpClient.post(
      "/products",
      normalizePayload(payload)
    );

    return res.data;
  },

  /**
   * UPDATE PRODUCT
   */
  update: async (id: string, payload: Partial<ProductFormValues>) => {
    const res = await httpClient.put(
      `/products/${id}`,
      normalizePayload(payload)
    );

    return res.data;
  },

  /**
   * DELETE PRODUCT
   */
  delete: async (id: string) => {
    const res = await httpClient.delete(`/products/${id}`);
    return res.data;
  },

  /**
   * UPLOAD PRODUCT IMAGES
   */
  uploadImage: async (
    productId: string,
    files: File[],
    type: ProductImageType = "GALLERY",
    sortOrder: number = 0
  ) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("type", type);
    formData.append("sortOrder", String(sortOrder));
    console.log("formData", formData);

    const res = await httpClient.post(
      `/products/${productId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      images: (res.data?.data?.images || []).map(normalizeImage),
    };
  },

  /**
   * SET PRODUCT THUMBNAIL
   */
  setThumbnail: async (imageId: string) => {
    const res = await httpClient.patch(
      `/images/${imageId}/thumbnail`
    );

    return res.data;
  },

  /**
   * DELETE PRODUCT IMAGE
   */
  deleteImage: async (imageId: string) => {
    const res = await httpClient.delete(`/images/${imageId}`);

    return res.data;
  },
};

export default productService;