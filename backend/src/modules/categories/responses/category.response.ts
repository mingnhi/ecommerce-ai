export class CategoryResponse {
  id: string;

  name: string;

  slug: string;

  parentId?: string;

  createdAt: Date;

  updatedAt?: Date;

  children?: CategoryResponse[];
}