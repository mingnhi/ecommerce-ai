import { request } from '../axios';
import { KEYS } from './keys';
import { CreateVnpayPaymentRequest, CreateVnpayPaymentResponse, VnpayReturnResponse } from './types';


export const PaymentService = {
    createVnpayPayment: async (
        data: CreateVnpayPaymentRequest,
    ): Promise<CreateVnpayPaymentResponse> => {
        const response = await request.post<CreateVnpayPaymentResponse>(
            KEYS.PAYMENT_CREATE,
            {
                amount: data.amount,
                orderInfo: data.orderInfo,
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