import { request } from '../axios';
import { KEYS } from './keys';
import { CreatePaymentRequest, CreatePaymentResponse, VnpayReturnResponse } from './types';


export const PaymentService = {
    createPayment: async (
        data: CreatePaymentRequest,
    ): Promise<CreatePaymentResponse> => {
        const response = await request.post<CreatePaymentResponse>(
            KEYS.PAYMENT_CREATE,
            {
                orderId: data.orderId,
                method: data.method,
            },
        );

        return response;
    },

    verifyVnpayReturn: async (
        queryString: string,
    ): Promise<VnpayReturnResponse> => {
        const response = await request.get<VnpayReturnResponse>(
            `${KEYS.PAYMENT_VNPAY_RETURN}?${queryString}`,
        );

        return response;
    },
};