import { useMutation, useQuery } from '@tanstack/react-query';
import { USER_EVENT_KEYS } from './keys';
import {
    getMyRecommendationsRequest,
    saveUserEventRequest,
} from './requests';

export const useSaveUserEvent = () => {
    return useMutation({
        mutationFn: saveUserEventRequest,
    });
};

export const useMyRecommendations = (limit = 10) => {
    return useQuery({
        queryKey: [...USER_EVENT_KEYS.RECOMMENDATIONS_ME, limit],
        queryFn: async () => {
            console.log("CALL FRONTEND RECOMMEND API");

            const res = await getMyRecommendationsRequest(limit);

            console.log("RECOMMEND RAW RESPONSE:", res);

            return res;
        },
    });
};