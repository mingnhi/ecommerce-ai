import { ProductResponse } from './product.response';

export class ProductPaginationResponse {
  items: ProductResponse[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}