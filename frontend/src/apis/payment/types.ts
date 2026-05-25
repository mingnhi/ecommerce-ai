export type ApiResponse<T> = {
    status?: string;
    message?: string;
    data: T;
};
export type PaymentMethod = 'VNPAY' | 'CASH';

export type CreatePaymentRequest = {
    orderId: string;
    method: PaymentMethod;
};

export type CreatePaymentData = {
    paymentId: string;
    orderId: string;
    method: PaymentMethod;
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    orderStatus: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
    amount: number;
    txnRef?: string;
    paymentUrl?: string;
    message?: string;
};
export type CreatePaymentResponse = ApiResponse<CreatePaymentData>;
export type VnpayReturnData = {
    paymentId: string;
    orderId: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    orderStatus: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
    amount: number;
    txnRef: string;
    vnpTransactionNo?: string;
    responseCode: string;
    transactionStatus?: string;
    bankCode?: string;
    payDate?: string;
    message: string;
};

export type VnpayReturnResponse = ApiResponse<VnpayReturnData>;