import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentResultPage from "@/modules/PaymentResultPage";
import { PaymentResultSkeleton } from "@/modules/PaymentResultPage/components/Skeleton";
import { siteConfig } from "@/configs/site";

export const metadata: Metadata = {
  title: `Kết quả thanh toán — ${siteConfig.name}`,
  description: "Xem kết quả đơn hàng của bạn",
};

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<PaymentResultSkeleton />}>
      <PaymentResultPage params={params} />
    </Suspense>
  );
}
