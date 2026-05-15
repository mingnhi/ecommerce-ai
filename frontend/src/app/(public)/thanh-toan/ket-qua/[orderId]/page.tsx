import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { ordersApi } from '@/apis/orders';
import { getOrderStatusLabel } from '@/lib/order-status-vn';
import { PaymentResultPolling } from './PaymentResultPolling';

const PAYMENT_TYPE_VI: Record<string, string> = {
  COD: 'Tiền mặt (COD)',
  PAYPAL: 'PayPal',
  STRIPE: 'Thẻ ngân hàng',
};

export default async function PaymentResultPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  
  // Fetch initial data on the server
  let initialOrder = null;
  try {
    initialOrder = await ordersApi.getById(orderId);
  } catch (error) {
    console.error('Failed to fetch order:', error);
  }

  if (!initialOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-gray-300" />
        </div>
        <h1 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h1>
        <p className="text-gray-500 mb-6">Mã đơn hàng #{orderId.slice(0, 8).toUpperCase()} không tồn tại hoặc đã bị xóa.</p>
        <Link href="/san-pham" className="text-[#FF6B35] font-semibold hover:underline">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <PaymentResultPolling orderId={orderId} initialOrder={initialOrder} initialPayment={null}>
      {({ order, payment, polling }) => {
        const isSuccess = order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'COMPLETED';
        const isPending = order.status === 'PENDING';
        const isFailed = order.status === 'CANCELLED';

        return (
          <div className="max-w-xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`h-2 w-full ${isSuccess ? 'bg-green-500' : isPending ? 'bg-yellow-400' : 'bg-red-500'}`} />

              <div className="p-8 text-center">
                {isSuccess && (
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                )}
                {isPending && (
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-10 w-10 text-yellow-500 animate-pulse" />
                  </div>
                )}
                {isFailed && (
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                )}

                {isSuccess && (
                  <>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Đặt hàng thành công! 🎉</h1>
                    <p className="text-gray-500 text-sm">Cảm ơn bạn đã mua sắm. Đơn hàng đang được xử lý.</p>
                  </>
                )}
                {isPending && (
                  <>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Đang chờ xác nhận</h1>
                    <p className="text-gray-500 text-sm">Hệ thống đang kiểm tra trạng thái thanh toán.</p>
                    {polling && <p className="text-xs text-gray-400 mt-2 animate-pulse">Đang cập nhật...</p>}
                  </>
                )}
                {isFailed && (
                  <>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Đơn hàng đã hủy</h1>
                    <p className="text-gray-500 text-sm">Rất tiếc, đơn hàng đã bị hủy. Bạn có thể thử lại.</p>
                  </>
                )}
              </div>

              <div className="border-t border-gray-100 px-8 py-5 space-y-3 bg-gray-50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Thông tin đơn hàng</h3>
                {[
                  { label: 'Mã đơn hàng', value: <span className="font-mono text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span> },
                  { label: 'Trạng thái', value: <span className={`font-semibold ${isSuccess ? 'text-green-600' : isPending ? 'text-yellow-600' : 'text-red-600'}`}>{getOrderStatusLabel(order.status)}</span> },
                  { label: 'Tổng tiền', value: <span className="font-bold text-[#FF6B35] text-base">{Number(order.totalPrice).toLocaleString('vi-VN')}đ</span> },
                  ...(payment ? [{ label: 'Phương thức', value: <span className="text-gray-700">{PAYMENT_TYPE_VI[payment.type] ?? payment.type}</span> }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    {value}
                  </div>
                ))}
              </div>

              <div className="px-8 py-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/don-hang/${order.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FF6B35] text-white font-semibold rounded-xl hover:bg-[#e85a2a] transition shadow-lg shadow-orange-100"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Xem đơn hàng
                </Link>
                <Link
                  href="/san-pham"
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#FF6B35] hover:text-[#FF6B35] transition"
                >
                  Tiếp tục mua sắm <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        );
      }}
    </PaymentResultPolling>
  );
}
