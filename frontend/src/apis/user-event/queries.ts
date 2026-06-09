import { useMutation, useQuery } from '@tanstack/react-query';
// import { getMockRecommendationData } from '@/faker/mock-recommendations';
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
        queryFn: () => getMyRecommendationsRequest(limit),
        // queryFn: () => Promise.resolve(getMockRecommendationData(limit)),
    });
};
