export class VariantResponse {
  id: string;

  productId: string;

  sku?: string;

  attributes?: Record<
    string,
    any
  >;

  isActive: boolean;

  createdAt: Date;
}