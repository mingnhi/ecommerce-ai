import {
  Link,
} from "react-router-dom";

import {
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

import {
  Button,
} from "@/shared/components/ui/button";

import type {
  Product,
} from "../types/product.type";

type Props = {
  products: Product[];

  loading?: boolean;

  onDelete: (
    id: string
  ) => void;
};

export const ProductTable =
  ({
    products,
    loading,
    onDelete,
  }: Props) => {
    if (loading) {
      return (
        <div className="rounded-xl border bg-white p-10 text-center">
          Loading...
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Product
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium">
                Category
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium">
                Price
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>

              <th className="px-4 py-3 text-right text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map(
              (
                product
              ) => (
                <tr
                  key={
                    product.id
                  }
                  className="border-t"
                >
                  {/* product */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          product.thumbnail ||
                          "https://placehold.co/80x80"
                        }
                        alt={
                          product.name
                        }
                        className="h-14 w-14 rounded-lg object-cover border"
                      />

                      <div>
                        <p className="font-medium">
                          {
                            product.name
                          }
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {
                            product.slug
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* category */}
                  <td className="px-4 py-4 text-sm">
                    {
                      product
                        .category
                        ?.name
                    }
                  </td>

                  {/* price */}
                  <td className="px-4 py-4 text-sm">
                    {product.price
                      ?.price?.toLocaleString(
                        "vi-VN"
                      )}{" "}
                    ₫
                  </td>

                  {/* status */}
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* detail */}
                      <Link
                        to={`/products/${product.slug}`}
                      >
                        <Button
                          size="icon"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      {/* edit */}
                      <Link
                        to={`/products/${product.id}/edit`}
                      >
                        <Button
                          size="icon"
                          variant="outline"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>

                      {/* delete */}
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() =>
                          onDelete(
                            product.id
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            )}

            {!products.length && (
              <tr>
                <td
                  colSpan={
                    5
                  }
                  className="py-10 text-center text-muted-foreground"
                >
                  No products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };