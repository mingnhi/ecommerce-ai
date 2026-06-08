import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getApiErrorMessage, getEnvelopeData } from '@/lib/api-response';
import { paymentResultRoute } from '@/lib/routes';
import { PaymentService } from './requests';
import type { CreatePaymentData, CreatePaymentRequest } from './types';

export const useVerifyVnpayReturn = (queryString: string) => {
  return useQuery({
    queryKey: ['payment', 'vnpay-return', queryString],
    queryFn: () => PaymentService.verifyVnpayReturn(queryString),
    enabled: queryString.includes('vnp_'),
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreatePayment = () => {
  const router = useRouter();

  return useMutation<CreatePaymentData | undefined, Error, CreatePaymentRequest>({
    mutationFn: async (data) => {
      const res = await PaymentService.createPayment(data);
      return getEnvelopeData<CreatePaymentData>(res);
    },
    onSuccess: (data) => {
      if (!data) {
        toast.error('Không tạo được thanh toán');
        return;
      }

      if (data.method === 'VNPAY' && data.paymentUrl) {
        toast.success('Đang chuyển đến VNPAY...');
        window.location.href = data.paymentUrl;
        return;
      }

      if (data.method === 'CASH') {
        toast.success(data.message || 'Đặt hàng thành công');
        router.push(paymentResultRoute(data.orderId));
        return;
      }

      toast.error('Không tạo được thanh toán');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Thanh toán thất bại'));
    },
  });
};
