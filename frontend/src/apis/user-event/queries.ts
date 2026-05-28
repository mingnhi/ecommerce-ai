import {
    useMutation,
    useQuery,
} from '@tanstack/react-query';
import { recommendProductsRequest, saveUserEventRequest } from './requests';
import { USER_EVENT_KEYS } from './keys';



export const useSaveUserEvent =
    () => {
        return useMutation({
            mutationFn: saveUserEventRequest,
        });
    };

export const useRecommendProducts =
    (topK: number = 10) => {
        return useQuery({
            queryKey: [
                ...USER_EVENT_KEYS.RECOMMEND_PRODUCTS,
                topK,
            ],

            queryFn: () =>
                recommendProductsRequest(topK),
        });
    };