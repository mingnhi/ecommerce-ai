export interface ICartLine {
  id: string;
  productId: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  variantLabel?: string;
}

export type ICartLineInput = Omit<ICartLine, "id">;
