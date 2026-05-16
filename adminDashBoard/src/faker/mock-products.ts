export type MockProductLine = {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export const MOCK_PRODUCTS: MockProductLine[] = [
  {
    productId: "mock-ip15p-256",
    name: "iPhone 15 Pro 256GB",
    price: 28_990_000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop",
  },
  {
    productId: "mock-s24u-512",
    name: "Samsung Galaxy S24 Ultra 512GB",
    price: 29_490_000,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=200&fit=crop",
  },
  {
    productId: "mock-pixel9-128",
    name: "Google Pixel 9 128GB",
    price: 18_990_000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&h=200&fit=crop",
  },
  {
    productId: "mock-xiaomi14-512",
    name: "Xiaomi 14 512GB",
    price: 16_990_000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop",
  },
]

export type MockTopSellingProduct = MockProductLine & { soldCount: number }

export const MOCK_TOP_SELLING: MockTopSellingProduct[] = MOCK_PRODUCTS.map((p, i) => ({
  ...p,
  soldCount: [752, 689, 541, 612][i] ?? 400,
}))
