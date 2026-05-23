import {
  useEffect,
  useState,
} from "react";

import {
  createProduct,
  deleteProduct,
  getProductDetail,
  getProducts,
  updateProduct,
} from "@/services/product";

import type {
  CreateProductPayload,
  Product,
  ProductQuery,
  UpdateProductPayload,
} from "@/features/products/types/product.type";

/**
 * GET products
 */
export const useProducts = (
  query?: ProductQuery
) => {
  const [
    products,
    setProducts,
  ] = useState<Product[]>(
    []
  );

  const [
    pagination,
    setPagination,
  ] = useState<any>(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const fetchProducts =
    async () => {
      try {
        setLoading(true);

        const res =
          await getProducts(
            query
          );

        setProducts(
          res.products
        );

        setPagination(
          res.pagination
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProducts();
  }, [
    query?.page,
    query?.limit,
    query?.search,
    query?.categoryId,
    query?.sort,
  ]);

  return {
    products,

    pagination,

    loading,

    refetch:
      fetchProducts,
  };
};

/**
 * GET product detail
 */
export const useProductDetail =
  (slug?: string) => {
    const [
      product,
      setProduct,
    ] =
      useState<Product | null>(
        null
      );

    const [
      loading,
      setLoading,
    ] = useState(false);

    const fetchProduct =
      async () => {
        if (!slug) return;

        try {
          setLoading(true);

          const data =
            await getProductDetail(
              slug
            );

          setProduct(data);
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
      fetchProduct();
    }, [slug]);

    return {
      product,

      loading,

      refetch:
        fetchProduct,
    };
  };

/**
 * CREATE product
 */
export const useCreateProduct =
  () => {
    const [
      loading,
      setLoading,
    ] = useState(false);

    const submit =
      async (
        payload: CreateProductPayload
      ) => {
        try {
          setLoading(true);

          return await createProduct(
            payload
          );
        } finally {
          setLoading(false);
        }
      };

    return {
      createProduct:
        submit,

      loading,
    };
  };

/**
 * UPDATE product
 */
export const useUpdateProduct =
  () => {
    const [
      loading,
      setLoading,
    ] = useState(false);

    const submit =
      async (
        id: string,
        payload: UpdateProductPayload
      ) => {
        try {
          setLoading(true);

          return await updateProduct(
            id,
            payload
          );
        } finally {
          setLoading(false);
        }
      };

    return {
      updateProduct:
        submit,

      loading,
    };
  };

/**
 * DELETE product
 */
export const useDeleteProduct =
  () => {
    const [
      loading,
      setLoading,
    ] = useState(false);

    const submit =
      async (
        id: string
      ) => {
        try {
          setLoading(true);

          return await deleteProduct(
            id
          );
        } finally {
          setLoading(false);
        }
      };

    return {
      deleteProduct:
        submit,

      loading,
    };
  };