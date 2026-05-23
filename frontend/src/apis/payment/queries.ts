import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PaymentService } from './requests';
import {
    CreateVnpayPaymentRequest,
} from './types';
import { KEYS } from './keys';

export const useCreateVnpayPayment = () => {
    return useMutation({
        mutationFn: async (
            data: CreateVnpayPaymentRequest,
        ) => {
            return await PaymentService.createVnpayPayment(data);
        },

        onSuccess: (response) => {
            if (response?.paymentUrl) {
                toast.success('Đang chuyển đến VNPAY...');

                // Redirect sang VNPAY
                window.location.href = response.paymentUrl;
            } else {
                toast.error('Không tạo được link thanh toán');
            }
        },

        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                'Thanh toán thất bại';

            toast.error(errorMessage);
        },
    });
};

export const useVerifyVnpayReturn = (
    queryString: string,
) => {
    return useQuery({
        queryKey: [
            KEYS.PAYMENT_VNPAY_RETURN,
            queryString,
        ],

        queryFn: async () => {
            return await PaymentService.verifyVnpayReturn(
                queryString,
            );
        },

        enabled: !!queryString,

        retry: 1,

        refetchOnWindowFocus: false,
    });
};