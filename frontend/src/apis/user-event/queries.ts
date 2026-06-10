import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
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
        queryFn: () => getMyRecommendationsRequest({ page: 1, limit }),
    });
};

export const useInfiniteMyRecommendations = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: [...USER_EVENT_KEYS.RECOMMENDATIONS_ME, 'infinite', limit],
        queryFn: ({ pageParam }) =>
            getMyRecommendationsRequest({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.meta;
            return page < totalPages ? page + 1 : undefined;
        },
    });
};
