import { request } from '../axios';
import {
    RecommendationData,
    SaveUserEventPayload,
} from './types';

export const saveUserEventRequest = async (
    payload: SaveUserEventPayload,
) => {
    return request.post('/user-events', payload);
};

export const getMyRecommendationsRequest = async (
    limit = 10,
): Promise<RecommendationData> => {
    const response = await request.get(
        `/user-events/recommendations/me?limit=${limit}`,
    );

    return response.data;
};