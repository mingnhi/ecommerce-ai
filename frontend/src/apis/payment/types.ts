export type ApiResponse<T> = {
    status?: string;
    message?: string;
    data: T;
};

export type CreateVnpayPaymentRequest = {
    amount: number;
    orderInfo: string;
};

export type CreateVnpayPaymentData = {
    paymentId: string;
    txnRef: string;
    paymentUrl: string;
};

export type CreateVnpayPaymentResponse =
    ApiResponse<CreateVnpayPaymentData>;

export type VnpayReturnData = {
    paymentId: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
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