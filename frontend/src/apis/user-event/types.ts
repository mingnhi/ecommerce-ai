import type { Product, ProductPaginationMeta } from '@/apis/product/types';

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

export interface GetRecommendationsParams {
    page?: number;
    limit?: number;
}

export interface RecommendationData {
    user_id: string;
    cold_start: boolean;
    total_products: number;
    recommendations: Product[];
    meta: ProductPaginationMeta;
}