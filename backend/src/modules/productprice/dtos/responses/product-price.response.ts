export class ProductPriceResponse {
  id: string;

  price: number;

  originalPrice?: number;

  discountPercent?: number;

  currency: string;

  isActive: boolean;

  startAt?: Date;

  endAt?: Date;

  createdAt: Date;
}