import type { VnpayReturnData } from '@/apis/payment/types';

export type PaymentDisplay = {
  txnRef: string | null;
  amount: number;
  bankCode: string | null;
  transactionNo: string | null;
  responseCode: string | null;
  message: string;
  isSuccess: boolean;
};

export type VnpaySnapshot = {
  hasParams: boolean;
  txnRef: string | null;
  amount: number;
  bankCode: string | null;
  transactionNo: string | null;
  responseCode: string | null;
  transactionStatus: string | null;
};

export function parseVnpaySnapshot(
  searchParams: URLSearchParams,
): VnpaySnapshot {
  const hasParams = [...searchParams.keys()].some((k) => k.startsWith('vnp_'));
  const amountRaw = searchParams.get('vnp_Amount');

  return {
    hasParams,
    txnRef: searchParams.get('vnp_TxnRef'),
    amount: amountRaw ? Number(amountRaw) / 100 : 0,
    bankCode: searchParams.get('vnp_BankCode'),
    transactionNo: searchParams.get('vnp_TransactionNo'),
    responseCode: searchParams.get('vnp_ResponseCode'),
    transactionStatus: searchParams.get('vnp_TransactionStatus'),
  };
}

export function buildPaymentDisplay(
  snapshot: VnpaySnapshot,
  apiData?: VnpayReturnData,
): PaymentDisplay {
  if (apiData) {
    return {
      txnRef: apiData.txnRef ?? snapshot.txnRef,
      amount: apiData.amount || snapshot.amount,
      bankCode: apiData.bankCode ?? snapshot.bankCode,
      transactionNo: apiData.vnpTransactionNo ?? snapshot.transactionNo,
      responseCode: apiData.responseCode ?? snapshot.responseCode,
      message: apiData.message,
      isSuccess: apiData.status === 'COMPLETED',
    };
  }

  const isSuccess =
    snapshot.responseCode === '00' && snapshot.transactionStatus === '00';

  return {
    txnRef: snapshot.txnRef,
    amount: snapshot.amount,
    bankCode: snapshot.bankCode,
    transactionNo: snapshot.transactionNo,
    responseCode: snapshot.responseCode,
    message: isSuccess
      ? 'Thanh toán VNPAY thành công'
      : vnpayFailureMessage(snapshot.responseCode),
    isSuccess,
  };
}

function vnpayFailureMessage(code: string | null): string {
  if (!code) {
    return 'Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.';
  }
  if (code === '24') {
    return 'Bạn đã hủy giao dịch trên cổng VNPAY.';
  }
  if (code === '51') {
    return 'Tài khoản không đủ số dư để thanh toán.';
  }
  return `Giao dịch không thành công (mã ${code}). Vui lòng thử lại hoặc liên hệ hỗ trợ.`;
}

export function shortOrderId(orderId: string) {
  if (orderId.length <= 12) return orderId;
  return `${orderId.slice(0, 8)}…${orderId.slice(-4)}`;
}
