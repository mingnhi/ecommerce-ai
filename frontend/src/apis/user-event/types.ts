export interface RecommendProduct {
    product_id: string;
    score: number;
    name: string;
    image: string;
    price: number;
    category_id: string;
}

export interface RecommendResponse {
    user_id: string;
    cold_start: boolean;
    total_products: number;
    recommendations: RecommendProduct[];
}

export interface SaveUserEventPayload {
    productId: string;
    categoryId: string;
    price: number;
    eventType:
    | "VIEW" | "CLICK" | "ADD_TO_CART" | "PURCHASE"| "REVIEW";
}