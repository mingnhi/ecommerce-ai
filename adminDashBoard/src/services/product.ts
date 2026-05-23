import { httpClient } from "@/services/http";

import type {
  Product,
  ProductQuery,
  CreateProductPayload,
  UpdateProductPayload,
} from "../features/products/types/product.type";

/**
 * normalize product
 */
const normalizeProduct = (
  product: any
): Product => {
  return {
    id: String(product.id),

    name: product.name,

    slug: product.slug,

    shortDescription:
      product.shortDescription,

    description:
      product.description,

    isActive:
      product.isActive,

    thumbnail:
      product.thumbnail,

    createdAt:
      product.createdAt,

    updatedAt:
      product.updatedAt,

    category: {
      id: String(
        product.category?.id
      ),

      name:
        product.category?.name,

      slug:
        product.category?.slug,
    },

    price: product.price
      ? {
          price:
            Number(
              product.price.price
            ),

          originalPrice:
            product.price
              .originalPrice
              ? Number(
                  product.price
                    .originalPrice
                )
              : undefined,

          discountPercent:
            product.price
              .discountPercent,

          currency:
            product.price
              .currency,
        }
      : undefined,

    prices:
      product.prices?.map(
        (price: any) => ({
          id: String(price.id),

          price:
            Number(price.price),

          originalPrice:
            price.originalPrice
              ? Number(
                  price.originalPrice
                )
              : undefined,

          discountPercent:
            price.discountPercent,

          currency:
            price.currency,

          isActive:
            price.isActive,
        })
      ) || [],

    variants:
      product.variants?.map(
        (variant: any) => ({
          id: String(
            variant.id
          ),

          title:
            variant.title,

          sku: variant.sku,

          stock:
            Number(
              variant.stock
            ),

          image:
            variant.image,

          price:
            variant.price
              ? Number(
                  variant.price
                )
              : undefined,

          isActive:
            variant.isActive,

          attributes:
            variant.attributes,
        })
      ) || [],

    attributes:
      product.attributes?.map(
        (attr: any) => ({
          id: String(attr.id),

          name: attr.name,

          value: attr.value,
        })
      ) || [],

    images:
      product.images?.map(
        (image: any) => ({
          id: String(image.id),

          imageUrl:
            image.imageUrl,

          type: image.type,

          sortOrder:
            image.sortOrder,

          isPrimary:
            image.isPrimary,
        })
      ) || [],

    reviewSummary:
      product.reviewSummary,
  };
};

/**
 * GET products
 */
export const getProducts =
  async (
    query?: ProductQuery
  ) => {
    const params =
      new URLSearchParams();

    if (query?.page) {
      params.append(
        "page",
        String(query.page)
      );
    }

    if (query?.limit) {
      params.append(
        "limit",
        String(query.limit)
      );
    }

    if (query?.search) {
      params.append(
        "search",
        query.search
      );
    }

    if (query?.categoryId) {
      params.append(
        "categoryId",
        query.categoryId
      );
    }

    if (query?.sort) {
      params.append(
        "sort",
        query.sort
      );
    }

    const res =
      await httpClient.get(
        `/products?${params.toString()}`
      );

    const rawProducts =
      res.data?.data
        ?.products || [];

    return {
      products:
        rawProducts.map(
          normalizeProduct
        ),

      pagination:
        res.data?.meta
          ?.pagination,
    };
  };

/**
 * GET product detail
 */
export const getProductDetail =
  async (slug: string) => {
    const res =
      await httpClient.get(
        `/products/${slug}`
      );

    return normalizeProduct(
      res.data?.data?.product
    );
  };

/**
 * CREATE product
 */
export const createProduct =
  async (
    payload: CreateProductPayload
  ) => {
    const res =
      await httpClient.post(
        "/products",
        payload
      );

    return res.data;
  };

/**
 * UPDATE product
 */
export const updateProduct =
  async (
    id: string,
    payload: UpdateProductPayload
  ) => {
    const res =
      await httpClient.put(
        `/products/${id}`,
        payload
      );

    return res.data;
  };

/**
 * DELETE product
 */
export const deleteProduct =
  async (
    id: string
  ) => {
    const res =
      await httpClient.delete(
        `/products/${id}`
      );

    return res.data;
  };