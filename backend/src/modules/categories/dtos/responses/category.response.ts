export class CategoryResponse {
  id: string;

  name: string;

  slug: string;

  isActive: boolean;

  createdAt: Date;

  parent?: {
    id: string;
    name: string;
    slug: string;
  };

  children?: CategoryResponse[];
}