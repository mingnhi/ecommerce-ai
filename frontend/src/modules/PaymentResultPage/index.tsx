"use client";

import { use, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useOrderDetailQuery } from "@/apis/order";
import { useVerifyVnpayReturn } from "@/apis/payment/queries";
import {
  buildPaymentDisplay,
  parseVnpaySnapshot,
} from "@/lib/payment-result";
import { PaymentResultSkeleton } from "./components/Skeleton";
import { PaymentResultView } from "./components/PaymentResultView";

type PaymentResultPageProps = {
  params: Promise<{ orderId: string }>;
};

export default function PaymentResultPage({ params }: PaymentResultPageProps) {
  const { orderId } = use(params);
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const snapshot = useMemo(
    () => parseVnpaySnapshot(searchParams),
    [searchParams],
  );

  const isCodResult = !snapshot.hasParams;
  const { data: order, isLoading: isOrderLoading } = useOrderDetailQuery(
    orderId,
    isCodResult,
  );
  const { data, isLoading, isFetching } = useVerifyVnpayReturn(queryString);

  if (isCodResult && isOrderLoading) {
    return <PaymentResultSkeleton />;
  }

  if (snapshot.hasParams && (isLoading || isFetching) && !data) {
    return <PaymentResultSkeleton />;
  }

  if (isCodResult) {
    return (
      <PaymentResultView
        variant="success"
        orderId={orderId}
        showVnpayDetails={false}
        display={{
          txnRef: null,
          amount: order?.totalPrice ?? 0,
          bankCode: null,
          transactionNo: null,
          responseCode: null,
          message: "Đặt hàng thành công",
          isSuccess: true,
        }}
        title="Đặt hàng thành công"
        description="Đơn hàng COD đã được ghi nhận. Bạn thanh toán khi nhận hàng."
      />
    );
  }

  const display = buildPaymentDisplay(snapshot, data?.data);

  return (
    <PaymentResultView
      variant={display.isSuccess ? "success" : "failed"}
      orderId={orderId}
      showVnpayDetails
      display={display}
      description={display.message}
    />
  );
}
