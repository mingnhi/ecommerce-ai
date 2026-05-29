import { httpClient } from "./http";

import type { Category } from "@/features/categories/types";

/**
 * normalize category
 */
const normalizeCategory = (
  category: unknown
): Category => {
  return {
    id: String(category.id),

    name: category.name,

    slug: category.slug,

    parentId:
      category.parentId === 0 ||
        category.parentId === "0" ||
        category.parentId === null
        ? "0"
        : String(
          category.parentId ||
          category.parent?.id ||
          "0"
        ),

    children:
      category.children?.map(
        normalizeCategory
      ) || [],

    createdAt:
      category.createdAt,

    updatedAt:
      category.updatedAt,
  };
};

/**
 * GET categories
 */
export const getCategories =
  async (
    type:
      | "tree"
      | "flat" = "tree"
  ) => {
    const res =
      await httpClient.get(
        `/categories?type=${type}`
      );

    console.log(
      "CATEGORY API =>",
      res.data
    );

    /**
     * FIX CHUẨN
     */
    const rawCategories =
      res.data?.data
        ?.categories || [];

    return {
      categories:
        rawCategories.map(
          normalizeCategory
        ),
    };
  };

/**
 * CREATE category
 */
export const createCategory =
  async (payload: {
    name: string;

    parentId?: string;
  }) => {
    const res =
      await httpClient.post(
        "/categories",
        {
          name: payload.name,

          parentId:
            payload.parentId ||
            "0",
        }
      );

    return res.data;
  };

/**
 * UPDATE category
 */
export const updateCategory =
  async (
    id: string,
    payload: {
      name?: string;

      parentId?: string;
    }
  ) => {
    const res =
      await httpClient.put(
        `/categories/${id}`,
        {
          ...payload,

          parentId:
            payload.parentId ||
            "0",
        }
      );

    return res.data;
  };

/**
 * DELETE category
 */
export const deleteCategory =
  async (
    id: string
  ) => {
    const res =
      await httpClient.delete(
        `/categories/${id}`
      );

    return res.data;
  };

