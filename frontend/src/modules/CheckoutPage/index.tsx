"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Ticket, Banknote, Landmark, Check, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatVnd } from "@/lib/format-currency";
import { siteConfig } from "@/configs/site";
import { useCart } from "@/hooks/use-cart";
import { CartVoucherPopover } from "@/modules/CartPage/components/CartVoucherPopover";
import { cn } from "@/lib/utils";
import { AddressDialog } from "./components/AddressDialog";
import {
  emptyCheckoutAddress,
  isCheckoutAddressReady,
  toCheckoutAddress,
} from "@/lib/checkout";
import { useAddresses } from "@/apis/address";
import { CheckoutItem } from "./components/CheckoutItem";
import { ROUTES } from "@/lib/routes";
import { useCreateOrder } from "@/apis/order";
import { useCreatePayment } from "@/apis/payment/queries";
import { PaymentMethod } from "@/apis/payment";


const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  { id: "CASH", label: "Thanh toán khi nhận hàng", icon: Banknote },
  { id: "VNPAY", label: "Thanh toán VNPAY", icon: Landmark },
];

function EmptyCheckout() {
  return (
    <div className="min-h-[calc(100vh-66px)] bg-muted/25 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-sky-500/10 rounded-full blur-3xl scale-150" />
          <div className="relative size-32 rounded-3xl bg-card border-2 border-border/50 flex items-center justify-center shadow-2xl rotate-3">
            <ShoppingBag className="size-14 text-sky-500/30 -rotate-3 stroke-[1.5]" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Không có sản phẩm thanh toán</h2>
          <p className="text-muted-foreground max-w-[300px] mx-auto leading-relaxed text-sm">
            Có vẻ như bạn chưa chọn sản phẩm nào để thanh toán. Vui lòng quay lại giỏ hàng để chọn sản phẩm.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            asChild
            className="h-12 px-8 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-lg shadow-sky-600/20 transition-all cursor-pointer hover:cursor-pointer"
          >
            <Link href={ROUTES.CART}>Quay về giỏ hàng</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-12 px-8 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <Link href={ROUTES.HOME} className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const { items } = useCart();
  const createOrder = useCreateOrder();
  const createPayment = useCreatePayment();
  const [note, setNote] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("CASH");
  const [isAddrDialogOpen, setIsAddrDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(emptyCheckoutAddress);
  const { data: savedAddresses = [] } = useAddresses();

  useEffect(() => {
    const latest = savedAddresses[0];
    if (latest) {
      setCurrentAddress(toCheckoutAddress(latest));
    }
  }, [savedAddresses]);

  const selectedItems = useMemo(() => {
    const idsParam = searchParams.get("ids");
    if (!idsParam) return [];
    const selectedIds = new Set(idsParam.split(","));
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, searchParams]);

  const totalQty = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  const subTotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = 0;
  const totalAmount = subTotal + shippingFee;
  const isPlacingOrder = createOrder.isPending || createPayment.isPending;

  const handlePlaceOrder = async () => {
    if (!isCheckoutAddressReady(currentAddress)) {
      toast.error("Vui lòng cập nhật địa chỉ nhận hàng");
      setIsAddrDialogOpen(true);
      return;
    }

    const cartItemIds = selectedItems.map((item) => item.id).filter(Boolean);
    if (cartItemIds.length === 0) {
      toast.error("Không có sản phẩm để đặt hàng");
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        shippingAddress: currentAddress.address,
        phone: currentAddress.phone,
        note: note.trim() || undefined,
        cartItemIds,
      });

      createPayment.mutate({
        orderId: order.id,
        method: selectedPayment,
      });
    } catch {
      return;
    }
  };

  const handleAddressSaved = (address: ReturnType<typeof toCheckoutAddress>) => {
    setCurrentAddress(address);
  };

  if (selectedItems.length === 0) {
    return <EmptyCheckout />;
  }

  return (
    <div className="min-h-[calc(100vh-66px)] py-6 dark:bg-background">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 space-y-4">
        <div className="bg-card shadow-sm rounded-sm overflow-hidden border border-border/40 relative">
          <div className="h-[3px] w-full bg-[repeating-linear-gradient(45deg,#6fa6d6,#6fa6d6_33px,transparent_0,transparent_41px,#f18d9b_0,#f18d9b_74px,transparent_0,transparent_82px)]" />
          <div className="p-6 md:p-7">
            <div className="flex items-center gap-2 text-sky-600 font-medium text-lg mb-4">
              <MapPin className="size-5 fill-sky-600 text-white" />
              Địa Chỉ Nhận Hàng
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-base">
              <div className="font-bold text-foreground">
                {currentAddress.name} {currentAddress.phone}
              </div>
              <div className="text-foreground">{currentAddress.address}</div>

              <div className="md:ml-auto">
                <AddressDialog
                  open={isAddrDialogOpen}
                  onOpenChange={setIsAddrDialogOpen}
                  savedAddress={currentAddress}
                  onSaved={handleAddressSaved}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card shadow-sm rounded-sm border border-border/40 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/50 text-sm text-muted-foreground font-medium hidden md:grid">
            <div className="col-span-6 text-foreground text-lg">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-right">Thành tiền</div>
          </div>

          {selectedItems.map((item) => (
            <CheckoutItem key={item.id} item={item} />
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b border-border/40 text-sm">
            <div className="p-6 flex items-center gap-4 border-b border-border/40 md:border-b-0">
              <span className="whitespace-nowrap text-foreground">
                Lời nhắn:
              </span>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Lưu ý cho Người bán..."
                className="flex-1 border-border/60 h-9 rounded-sm focus-visible:ring-1 focus-visible:ring-border/60 shadow-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="p-6 border-b border-border/40 bg-[#fafdff] dark:bg-muted/10">
            <div className="flex justify-end items-center gap-3">
              <span className="text-muted-foreground text-sm">
                Tổng số tiền ({totalQty} sản phẩm):
              </span>
              <span className="text-xl font-semibold text-sky-500">
                {formatVnd(subTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card shadow-sm rounded-sm border border-border/40 overflow-hidden text-sm">
          <div className="p-6 py-5 flex items-center justify-between border-b border-border/40">
            <div className="flex items-center gap-2">
              <Ticket className="size-5 text-sky-500" />
              <span className="text-foreground text-base">Voucher</span>
            </div>
            <CartVoucherPopover>
              <button className="text-sky-600 font-medium hover:underline text-sm cursor-pointer">
                Chọn nhập mã
              </button>
            </CartVoucherPopover>
          </div>
        </div>

        <div className="bg-card shadow-sm rounded-sm border border-border/40 overflow-hidden pb-6">
          <div className="p-6 border-b border-border/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="text-lg text-foreground font-bold">
                Phương thức thanh toán
              </div>
              <div className="flex flex-wrap gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPayment === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={cn(
                        "relative flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all cursor-pointer group hover:cursor-pointer",
                        isSelected
                          ? "border-sky-500 bg-sky-500/5 text-sky-500"
                          : "border-border hover:border-sky-500/50 hover:bg-muted/30 text-muted-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5 transition-colors",
                          isSelected
                            ? "text-sky-600"
                            : "group-hover:text-sky-600",
                        )}
                      />
                      <span className="text-sm font-bold">{method.label}</span>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-sky-500 text-white size-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Check className="size-3 stroke-[4]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-6 py-8 border-b border-border/40 bg-muted/5">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 text-foreground/80">
                  <div className="bg-sky-500/10 p-2 rounded-lg">
                    {(() => {
                      const method = PAYMENT_METHODS.find(
                        (m) => m.id === selectedPayment,
                      );
                      const Icon = method?.icon || Banknote;
                      return <Icon className="size-5 text-sky-500" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Phương thức đã chọn</p>
                    <p className="text-xs text-muted-foreground">
                      {
                        PAYMENT_METHODS.find((m) => m.id === selectedPayment)
                          ?.label
                      }
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  * Vui lòng kiểm tra lại thông tin đơn hàng trước khi xác nhận
                  đặt hàng. <br />* Bạn có thể thay đổi phương thức thanh toán
                  bất cứ lúc nào trước khi nhấn "Đặt hàng".
                </p>
              </div>
              <div className="w-full md:w-[350px] space-y-3">
                <div className="pt-4  flex justify-between items-center">
                  <span className="text-base font-bold text-foreground">
                    Tổng thanh toán
                  </span>
                  <span className="text-2xl font-black text-sky-500 tracking-tight">
                    {formatVnd(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border/40 border-dashed flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground max-w-[600px] leading-relaxed">
              Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo{" "}
              <Link
                href="#"
                className="text-sky-500 hover:underline font-bold cursor-pointer"
              >
                Điều khoản {siteConfig.name}
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              <Button
                asChild
                variant="ghost"
                className="h-10 px-8 text-md font-bold border border-sky-500 text-sky-600 hover:text-sky-500 hover:bg-white transition-all cursor-pointer rounded-xl hover:scale-[1.02] hover:cursor-pointer"
              >
                <Link href={ROUTES.CART}>Trở lại giỏ hàng</Link>
              </Button>
              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full md:w-[200px] h-10 text-md font-black rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-xl shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase cursor-pointer hover:cursor-pointer"
              >
                Đặt hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

