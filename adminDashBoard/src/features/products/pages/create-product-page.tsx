import {
  useNavigate,
} from "react-router-dom";

import { toast } from "sonner";

import {
  ProductForm,
} from "../components/product-form";

import {
  useCreateProduct,
} from "../hooks/products";

import type {
  CreateProductPayload,
} from "../types/product.type";

export const CreateProductPage =
  () => {
    const navigate =
      useNavigate();

    const createMutation =
      useCreateProduct();

    const handleSubmit =
      async (
        values: CreateProductPayload
      ) => {
        try {
          await createMutation.mutateAsync(
            values
          );

          toast.success(
            "Create product successfully"
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
            "Create product failed"
          );
        }
      };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Create Product
          </h1>

          <p className="text-muted-foreground">
            Create new product
          </p>
        </div>

        <ProductForm
          loading={
            createMutation.isPending
          }
          onSubmit={
            handleSubmit
          }
        />
      </div>
    );
  };