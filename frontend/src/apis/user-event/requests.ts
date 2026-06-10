import { request } from '../axios';
import {
    GetRecommendationsParams,
    RecommendationData,
    SaveUserEventPayload,
} from './types';

export const saveUserEventRequest = async (
    payload: SaveUserEventPayload,
) => {
    return request.post('/user-events', payload);
};

export const getMyRecommendationsRequest = async (
    params: GetRecommendationsParams = {},
): Promise<RecommendationData> => {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const response = await request.get(
        `/user-events/recommendations/me?page=${page}&limit=${limit}`,
    );

    return response.data;
};