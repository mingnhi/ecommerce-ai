import {
  useNavigate,
} from "react-router-dom";

import {
  Plus,
} from "lucide-react";

import {
  Button,
} from "@/shared/components/ui/button";

import {
  ProductTable,
} from "../components/product-table";

import {
  useDeleteProduct,
  useProducts,
} from "../hooks/products";

export const ProductsPage =
  () => {
    const navigate =
      useNavigate();

    const {
      data,
      isLoading,
    } = useProducts();

    const deleteMutation =
      useDeleteProduct();

    const handleDelete =
      async (
        id: string
      ) => {
        const confirmDelete =
          window.confirm(
            "Delete this product?"
          );

        if (
          !confirmDelete
        )
          return;

        try {
          await deleteMutation.mutateAsync(
            id
          );
        } catch (
          error
        ) {
          console.error(
            error
          );
        }
      };

    return (
      <div className="space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Products
            </h1>

            <p className="text-muted-foreground">
              Manage your products
            </p>
          </div>

          <Button
            onClick={() =>
              navigate(
                "/products/create"
              )
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </div>

        {/* table */}
        <ProductTable
          products={
            data
              ?.products ||
            []
          }
          loading={
            isLoading
          }
          onDelete={
            handleDelete
          }
        />
      </div>
    );
  };