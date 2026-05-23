export type CreateVnpayPaymentRequest = {
    amount: number;
    orderInfo: string;
};

export type CreateVnpayPaymentResponse = {
    paymentId: string;
    txnRef: string;
    paymentUrl: string;
};

export type VnpayReturnResponse = {
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