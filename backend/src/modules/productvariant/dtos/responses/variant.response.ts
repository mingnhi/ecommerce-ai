
export class VariantResponse {
  id: string;

  title: string;

  sku: string;

  stock: number;

  image?: string;

  price?: number;

  attributes?: Record<
    string,
    any
  >;

  isActive: boolean;

  createdAt: Date;
}

