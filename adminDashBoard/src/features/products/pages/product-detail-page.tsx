import {
  useParams,
  Link,
} from "react-router-dom";

import {
  ArrowLeft,
  Pencil,
} from "lucide-react";

import {
  Button,
} from "@/shared/components/ui/button";

import {
  useProductDetail,
} from "../hooks/products";

export const ProductDetailPage =
  () => {
    const { slug } =
      useParams();

    const {
      data,
      isLoading,
    } =
      useProductDetail(
        slug || ""
      );

    const product =
      data?.product;

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
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/products"
            >
              <Button
                size="icon"
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <div>
              <h1 className="text-3xl font-bold">
                {
                  product.name
                }
              </h1>

              <p className="text-muted-foreground">
                {
                  product.slug
                }
              </p>
            </div>
          </div>

          <Link
            to={`/products/${product.id}/edit`}
          >
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>

        {/* content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* left */}
          <div className="space-y-6 lg:col-span-2">
            {/* images */}
            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">
                Images
              </h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {product.images?.map(
                  (
                    image
                  ) => (
                    <img
                      key={
                        image.id
                      }
                      src={
                        image.imageUrl
                      }
                      alt=""
                      className="aspect-square rounded-lg border object-cover"
                    />
                  )
                )}
              </div>
            </div>

            {/* description */}
            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">
                Description
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-sm font-medium">
                    Short
                    Description
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {product.shortDescription ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-sm font-medium">
                    Full
                    Description
                  </p>

                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {product.description ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* variants */}
            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">
                Variants
              </h2>

              <div className="space-y-3">
                {product.variants?.map(
                  (
                    variant
                  ) => (
                    <div
                      key={
                        variant.id
                      }
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {
                              variant.title
                            }
                          </p>

                          <p className="text-sm text-muted-foreground">
                            SKU:
                            {" "}
                            {
                              variant.sku
                            }
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-medium">
                            {variant.price?.toLocaleString(
                              "vi-VN"
                            )}{" "}
                            ₫
                          </p>

                          <p className="text-sm text-muted-foreground">
                            Stock:
                            {" "}
                            {
                              variant.stock
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {!product.variants
                  ?.length && (
                  <p className="text-sm text-muted-foreground">
                    No
                    variants
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* right */}
          <div className="space-y-6">
            {/* info */}
            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">
                Product
                Info
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    Category
                  </p>

                  <p className="font-medium">
                    {
                      product
                        .category
                        .name
                    }
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Price
                  </p>

                  <p className="font-medium">
                    {product.prices?.[0]?.price?.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    ₫
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Status
                  </p>

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
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Created
                    At
                  </p>

                  <p className="font-medium">
                    {new Date(
                      product.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* attributes */}
            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">
                Attributes
              </h2>

              <div className="space-y-3">
                {product.attributes?.map(
                  (
                    attr
                  ) => (
                    <div
                      key={
                        attr.id
                      }
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <span className="text-sm text-muted-foreground">
                        {
                          attr.name
                        }
                      </span>

                      <span className="text-sm font-medium">
                        {
                          attr.value
                        }
                      </span>
                    </div>
                  )
                )}

                {!product.attributes
                  ?.length && (
                  <p className="text-sm text-muted-foreground">
                    No
                    attributes
                  </p>
                )}
              </div>
            </div>

            {/* reviews */}
            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">
                Review
                Summary
              </h2>

              <div className="space-y-2">
                <p className="text-3xl font-bold">
                  {
                    product
                      .reviewSummary
                      ?.averageRating
                  }
                  /5
                </p>

                <p className="text-sm text-muted-foreground">
                  {
                    product
                      .reviewSummary
                      ?.totalReviews
                  }{" "}
                  reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };