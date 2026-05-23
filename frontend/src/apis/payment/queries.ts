import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PaymentService } from './requests';
import {
    CreatePaymentRequest,
} from './types';
import { KEYS } from './keys';

export const useCreatePayment = () => {
    return useMutation({
        mutationFn: async (data: CreatePaymentRequest) => {
            return await PaymentService.createPayment(data);
        },

        onSuccess: (response) => {
            const data = response?.data;

            if (data?.method === 'VNPAY' && data?.paymentUrl) {
                toast.success('Đang chuyển đến VNPAY...');
                window.location.href = data.paymentUrl;
                return;
            }

            if (data?.method === 'CASH') {
                toast.success(data.message || 'Đặt hàng COD thành công');
                return;
            }

            toast.error('Không tạo được thanh toán');
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