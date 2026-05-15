export class PriceResponse {
  id: string;

  productId: string;

  price: number;

  originalPrice?: number;

  discountPercent?: number;

  startAt?: Date;

  endAt?: Date;
}