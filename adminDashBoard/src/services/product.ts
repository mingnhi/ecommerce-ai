import { httpClient } from "./http";
import type {
  Product,
  ProductFormValues,
  ProductImage,
  ProductListItem,
  ProductListQuery,
  ProductImageType,
} from "../features/products/types/product.type";

type ApiImage = {
  id?: string | number;
  imageUrl?: string;
  publicId?: string;
  type?: ProductImageType;
  sortOrder?: number;
  isPrimary?: boolean;
  createdAt?: string;
};

type ApiPrice = {
  id?: string | number;
  originalPrice?: number | string;
  discountPercent?: number | string;
  price?: number | string;
  currency?: string;
  isActive?: boolean;
};

type ApiVariant = {
  id?: string | number;
  title?: string;
  sku?: string;
  stock?: number | string;
  price?: number | string;
  image?: string;
  isActive?: boolean;
  attributes?: Record<string, string>;
};

type ApiAttribute = {
  id?: string | number;
  name?: string;
  value?: string;
};

type ApiCategoryRef = {
  id?: string | number;
  name?: string;
  slug?: string;
};

type ApiProductListItem = {
  id?: string | number;
  name?: string;
  slug?: string;
  shortDescription?: string;
  thumbnail?: string | null;
  isActive?: boolean;
  createdAt?: string;
  category?: ApiCategoryRef;
  price?: ApiPrice | null;
};

type ApiProductDetail = ApiProductListItem & {
  description?: string;
  updatedAt?: string;
  prices?: ApiPrice[];
  variants?: ApiVariant[];
  attributes?: ApiAttribute[];
  images?: ApiImage[];
};

const normalizeImage = (image: ApiImage): ProductImage => ({
  id: String(image.id),
  imageUrl: image.imageUrl || "",
  publicId: image.publicId || "",
  type: image.type || "GALLERY",
  sortOrder: image.sortOrder ?? 0,
  isPrimary: Boolean(image.isPrimary),
  createdAt: image.createdAt,
});

const normalizePayload = (payload: Partial<ProductFormValues>) => ({
  categoryId: payload.categoryId,
  name: payload.name,
  shortDescription: payload.shortDescription,
  description: payload.description,
  isActive: payload.isActive,

  prices: (payload.prices ?? []).map((p) => ({
    originalPrice: Number(p.originalPrice),
    discountPercent: p.discountPercent !== undefined ? Number(p.discountPercent) : undefined,
    currency: p.currency || "VND",
    isActive: p.isActive ?? true,
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

export const productService = {
  getAll: async (params?: ProductListQuery) => {
    const res = await httpClient.get("/products", { params });
    const products = (res.data?.data || []).map((p: ApiProductListItem) => ({
      id: String(p.id),
      name: p.name ?? "",
      slug: p.slug ?? "",
      shortDescription: p.shortDescription || "",
      thumbnail: p.thumbnail || null,
      isActive: Boolean(p.isActive),
      createdAt: p.createdAt,
      category: {
        id: String(p.category?.id || ""),
        name: p.category?.name || "",
        slug: p.category?.slug || "",
      },
      price: p.price
        ? {
          originalPrice: Number(p.price.originalPrice || 0),
          discountPercent: p.price.discountPercent !== undefined ? Number(p.price.discountPercent) : undefined,
          price: Number(p.price.price || 0),
          currency: p.price.currency || "VND",
        }
        : null,
    })) as ProductListItem[];

    return { products, meta: res.data?.meta || {} };
  },

  getBySlug: async (slug: string) => {
    const res = await httpClient.get(`/products/${slug}`);
    const p = res.data?.data as ApiProductDetail;

    return {
      product: {
        id: String(p.id),
        name: p.name ?? "",
        slug: p.slug ?? "",
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
        prices: (p.prices || []).map((price) => ({
          id: String(price.id),
          originalPrice: Number(price.originalPrice),
          discountPercent: price.discountPercent !== undefined ? Number(price.discountPercent) : undefined,
          price: Number(price.price),
          currency: price.currency || "VND",
          isActive: Boolean(price.isActive),
        })),
        variants: (p.variants || []).map((v) => ({
          id: String(v.id),
          title: v.title ?? "",
          sku: v.sku ?? "",
          stock: Number(v.stock ?? 0),
          price: v.price !== undefined ? Number(v.price) : undefined,
          image: v.image,
          isActive: Boolean(v.isActive),
          attributes: v.attributes || {},
        })),
        attributes: (p.attributes || []).map((a) => ({
          id: String(a.id),
          name: a.name ?? "",
          value: a.value ?? "",
        })),
        images: (p.images || []).map(normalizeImage),
      } as Product,
    };
  },

  create: async (payload: ProductFormValues) => {
    const res = await httpClient.post("/products", normalizePayload(payload));
    return res.data;
  },

  update: async (id: string, payload: Partial<ProductFormValues>) => {
    const res = await httpClient.put(`/products/${id}`, normalizePayload(payload));
    return res.data;
  },

  delete: async (id: string) => {
    const res = await httpClient.delete(`/products/${id}`);
    return res.data;
  },

  uploadImage: async (
    productId: string,
    files: File[],
    type: ProductImageType = "GALLERY",
    sortOrder: number = 0,
  ) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("type", type);
    formData.append("sortOrder", String(sortOrder));

    const res = await httpClient.post(`/products/${productId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      images: (res.data?.data?.images || []).map((image: ApiImage) => normalizeImage(image)),
    };
  },

  setThumbnail: async (imageId: string) => {
    const res = await httpClient.patch(`/images/${imageId}/thumbnail`);
    return res.data;
  },

  deleteImage: async (imageId: string) => {
    const res = await httpClient.delete(`/images/${imageId}`);
    return res.data;
  },
};

export default productService;
