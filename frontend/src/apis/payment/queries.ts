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
            const paymentUrl =
                response?.data?.paymentUrl ;

            if (paymentUrl) {
                toast.success('Đang chuyển đến VNPAY...');
                window.location.href = paymentUrl;
                return;
            }

            console.log('Payment response:', response);
            toast.error('Không tạo được link thanh toán');
        },

        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Thanh toán thất bại';

            toast.error(errorMessage);
        },
    });
};

export const useVerifyVnpayReturn = (queryString: string) => {
    return useQuery({
        queryKey: [KEYS.PAYMENT_VNPAY_RETURN, queryString],

        queryFn: async () => {
            return await PaymentService.verifyVnpayReturn(queryString);
        },

        enabled: !!queryString,

        retry: 1,

        refetchOnWindowFocus: false,
    });
};