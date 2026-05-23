import {
  useMemo,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "sonner";

import {
  ProductForm,
} from "../components/product-form";

import {
  useProductDetail,
  useUpdateProduct,
} from "../hooks/products";

import type {
  CreateProductPayload,
} from "../types/product.type";

export const EditProductPage =
  () => {
    const navigate =
      useNavigate();

    const { id } =
      useParams();

    const {
      data,
      isLoading,
    } =
      useProductDetail(
        id || ""
      );

    const updateMutation =
      useUpdateProduct();

    const product =
      data?.product;

    const defaultValues =
      useMemo(() => {
        if (!product)
          return undefined;

        return {
          categoryId:
            product.category
              .id,

          name:
            product.name,

          shortDescription:
            product.shortDescription,

          description:
            product.description,

          isActive:
            product.isActive,

          prices:
            product.prices.map(
              (
                item
              ) => ({
                price:
                  item.price,

                originalPrice:
                  item.originalPrice,

                discountPercent:
                  item.discountPercent,

                currency:
                  item.currency,
              })
            ),

          variants:
            product.variants.map(
              (
                item
              ) => ({
                title:
                  item.title,

                sku:
                  item.sku,

                stock:
                  item.stock,

                image:
                  item.image,

                price:
                  item.price,

                attributes:
                  item.attributes,
              })
            ),

          attributes:
            product.attributes.map(
              (
                item
              ) => ({
                name:
                  item.name,

                value:
                  item.value,
              })
            ),
        };
      }, [product]);

    const handleSubmit =
      async (
        values: CreateProductPayload
      ) => {
        if (!id)
          return;

        try {
          await updateMutation.mutateAsync(
            {
              id,
              payload:
                values,
            }
          );

          toast.success(
            "Update product successfully"
          );

          navigate(
            "/products"
          );
        } catch (
          error
        ) {
          console.error(
            error
          );

          toast.error(
            "Update product failed"
          );
        }
      };

    if (
      isLoading
    ) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    if (
      !product
    ) {
      return (
        <div>
          Product not found
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Edit Product
          </h1>

          <p className="text-muted-foreground">
            Update product
            information
          </p>
        </div>

        <ProductForm
          loading={
            updateMutation.isPending
          }
          defaultValues={
            defaultValues
          }
          onSubmit={
            handleSubmit
          }
        />
      </div>
    );
  };