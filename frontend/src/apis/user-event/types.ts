export type UserEventType =
    | 'VIEW'
    | 'CLICK'
    | 'ADD_TO_CART'
    | 'PURCHASE'
    | 'REVIEW';

export interface SaveUserEventPayload {
    productId: string;
    categoryId: string;
    price: number;
    eventType: UserEventType;
}

export interface RecommendedProduct {
    id: string;
    category_id: string;
    price: number;
    name: string;
    image: string;
    recommendScore: number;
}

export interface RecommendationData {
    user_id: string;
    cold_start: boolean;
    total_products: number;
    recommendations: RecommendedProduct[];
}