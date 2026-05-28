import { request } from '../axios';
import { RecommendResponse, SaveUserEventPayload } from './types';



export const saveUserEventRequest = async (
    payload: SaveUserEventPayload,
) => {
    return request.post(
        '/user-events',
        payload,
    );
};

export const recommendProductsRequest =
    async (
        topK: number = 10,
    ): Promise<RecommendResponse> => {
        const response = await request.post(
            '/user-events/recommend',
            {
                top_k: topK,
            },
        );

        return response.data;
    };