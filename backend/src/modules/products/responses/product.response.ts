export class ProductResponse {
  id: string;

  name: string;

  slug: string;

  description?: string;

  isActive: boolean;

  categoryId?: string;

  categoryName?: string;

  createdAt: Date;

  updatedAt?: Date;
}