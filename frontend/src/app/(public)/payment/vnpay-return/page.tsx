"use client";

import { useSearchParams } from "next/navigation";

export default function VnpayReturnPage() {
  const searchParams = useSearchParams();

  const responseCode = searchParams.get("vnp_ResponseCode");
  const transactionStatus = searchParams.get("vnp_TransactionStatus");
  const amount = searchParams.get("vnp_Amount");
  const orderInfo = searchParams.get("vnp_OrderInfo");

  const isSuccess = responseCode === "00" && transactionStatus === "00";

  return (
    <div style={{ padding: 40 }}>
      <h1>{isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}</h1>

      <p>Mã phản hồi: {responseCode}</p>
      <p>Trạng thái giao dịch: {transactionStatus}</p>
      <p>Số tiền: {amount ? Number(amount) / 100 : 0} VND</p>
      <p>Nội dung: {orderInfo}</p>
    </div>
  );
}
