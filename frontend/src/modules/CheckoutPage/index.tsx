"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import { MapPin, Ticket, Banknote, Landmark, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatVnd } from "@/lib/format-currency";
import { siteConfig } from "@/configs/site";
import { useCart } from "@/hooks/use-cart";
import { getImageUrl } from "@/lib/api-assets";
import { CartVoucherPopover } from "@/modules/CartPage/components/CartVoucherPopover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MOCK_PROVINCES, MOCK_WARDS } from "@/faker/mock-address";

const PAYMENT_METHODS = [
  { id: "cod", label: "Thanh toán khi nhận hàng", icon: Banknote },
  { id: "bank", label: "Chuyển khoản ngân hàng", icon: Landmark },
];

const ADDRESSES = [
  { id: "1", name: "Trịnh Thị Thanh Tâm", phone: "(+84) 941 692 448", address: "99 Tôn Thất Thiệp, Phường Ngũ Hành Sơn, Thành phố Đà Nẵng", isDefault: true },
  { id: "2", name: "Trịnh Thị Thanh Tâm", phone: "(+84) 941 692 448", address: "K72/10 Nguyễn Văn Thoại, Phường Mỹ An, Quận Ngũ Hành Sơn, Đà Nẵng", isDefault: false },
];

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const { items } = useCart();
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [selectedAddrId] = useState("1");
  const [isAddrDialogOpen, setIsAddrDialogOpen] = useState(false);
  const [addrType, setAddrType] = useState("home");

  const [province, setProvince] = useState("danang");
  const [ward, setWard] = useState("dn-1");
  const [isKhuVucOpen, setIsKhuVucOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("province");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isAddrDialogOpen && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isAddrDialogOpen]);

  const selectedProvinceLabel = MOCK_PROVINCES.find(p => p.id === province)?.name;
  const selectedWardLabel = MOCK_WARDS[province]?.find(w => w.id === ward)?.name;
  const khuVucLabel = selectedProvinceLabel && selectedWardLabel
    ? `${selectedProvinceLabel}, ${selectedWardLabel}`
    : "Tỉnh/Thành Phố, Quận/Huyện";

  const selectedAddress = useMemo(() =>
    ADDRESSES.find(a => a.id === selectedAddrId) || ADDRESSES[0]
    , [selectedAddrId]);

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

  return (
    <div className="min-h-[calc(100vh-66px)] py-6 dark:bg-background">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 space-y-4">
        <div className="bg-card shadow-sm rounded-sm overflow-hidden border border-border/40 relative">
          <div className="h-[3px] w-full bg-[repeating-linear-gradient(45deg,#6fa6d6,#6fa6d6_33px,transparent_0,transparent_41px,#f18d9b_0,#f18d9b_74px,transparent_0,transparent_82px)]" />
          <div className="p-6 md:p-7">
            <div className="flex items-center gap-2 text-primary font-medium text-lg mb-4">
              <MapPin className="size-5 fill-primary text-primary-foreground" />
              Địa Chỉ Nhận Hàng
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-base">
              <div className="font-bold text-foreground">
                {selectedAddress.name} {selectedAddress.phone}
              </div>
              <div className="text-foreground">
                {selectedAddress.address}
              </div>

              <div className="md:ml-auto">
                <Dialog open={isAddrDialogOpen} onOpenChange={setIsAddrDialogOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors cursor-pointer hover:underline">
                      Thay Đổi
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <div className="p-8 space-y-6">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold text-foreground">
                          Chỉnh sửa địa chỉ
                        </DialogTitle>
                      </DialogHeader>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 group">
                          <div className="relative">
                            <Input
                              id="fullname"
                              placeholder="Trịnh Thị Thanh Tâm"
                              className="h-14 pt-4 pb-1 px-4 border-muted-foreground/30 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-lg font-medium"
                            />
                            <Label htmlFor="fullname" className="absolute left-4 top-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Họ và tên</Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="relative">
                            <Input
                              id="phone"
                              placeholder="(+84) 941 692 448"
                              className="h-14 pt-4 pb-1 px-4 border-muted-foreground/30 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-lg font-medium"
                            />
                            <Label htmlFor="phone" className="absolute left-4 top-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Số điện thoại</Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Popover open={isKhuVucOpen} onOpenChange={setIsKhuVucOpen} modal={true}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="w-full flex items-center justify-between h-14 pt-4 pb-1 px-4 border border-muted-foreground/30 focus:ring-1 focus:ring-primary/20 focus:border-primary rounded-lg font-medium text-left bg-background transition-all outline-none"
                              >
                                <span className={cn(khuVucLabel === "Tỉnh/Thành Phố, Quận/Huyện" ? "text-muted-foreground/50" : "text-foreground")}>
                                  {khuVucLabel}
                                </span>
                                <ChevronRight className={cn("size-4 text-muted-foreground/60 transition-transform rotate-90")} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[calc(600px-64px)] h-[300px] p-0 shadow-2xl border-none rounded-xl overflow-hidden" align="start" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
                              <div className="flex h-full flex-col bg-background">
                                <Tabs
                                  value={activeTab}
                                  onValueChange={setActiveTab}
                                  className="min-h-0 flex flex-1 flex-col"
                                >
                                  <TabsList className="w-full h-12 bg-transparent border-b rounded-t-xl p-0">
                                    <TabsTrigger
                                      value="province"
                                      className="flex-1 h-full rounded-t-xl border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-bold text-sm"
                                    >
                                      Tỉnh/Thành Phố
                                    </TabsTrigger>

                                    <TabsTrigger
                                      value="ward"
                                      disabled={!province}
                                      className="flex-1 h-full rounded-t-xl border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary font-bold text-sm"
                                    >
                                      Phường/ Xã
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent
                                    value="province"
                                    className="relative m-0 flex-1 overflow-hidden"
                                  >
                                    <ScrollArea className="h-full" type="always">
                                      <div className="p-2 pr-4">
                                        <div className="grid grid-cols-1 gap-1">
                                          {MOCK_PROVINCES.map((p) => (
                                            <button
                                              key={p.id}
                                              type="button"
                                              onClick={() => {
                                                setProvince(p.id);
                                                setActiveTab("ward");
                                              }}
                                              className={cn(
                                                "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-all hover:bg-primary/5",
                                                province === p.id
                                                  ? "bg-primary/5 font-bold text-primary"
                                                  : "text-foreground/80"
                                              )}
                                            >
                                              <span>{p.name}</span>
                                              {province === p.id && <Check className="size-4" />}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <ScrollBar orientation="vertical" className="z-50" />
                                    </ScrollArea>
                                  </TabsContent>

                                  <TabsContent
                                    value="ward"
                                    className="relative m-0 flex-1 overflow-hidden"
                                  >
                                    <ScrollArea className="h-full" type="always">
                                      <div className="p-2 pr-4">
                                        <div className="grid grid-cols-1 gap-1">
                                          {MOCK_WARDS[province]?.map((w) => (
                                            <button
                                              key={w.id}
                                              type="button"
                                              onClick={() => {
                                                setWard(w.id);
                                                setIsKhuVucOpen(false);
                                              }}
                                              className={cn(
                                                "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-all hover:bg-primary/5",
                                                ward === w.id
                                                  ? "bg-primary/5 font-bold text-primary"
                                                  : "text-foreground/80"
                                              )}
                                            >
                                              <span>{w.name}</span>
                                              {ward === w.id && <Check className="size-4" />}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <ScrollBar orientation="vertical" className="z-50" />
                                    </ScrollArea>
                                  </TabsContent>
                                </Tabs>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Label className="absolute left-4 top-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider z-10 pointer-events-none">Tỉnh/Thành Phố, Quận/Huyện</Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Textarea
                            id="address-detail"
                            ref={textareaRef}
                            placeholder="99 Tôn Thất Thiệp"
                            onChange={handleTextareaChange}
                            className="min-h-[10px] pt-5 px-4 border-muted-foreground/30 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-lg font-medium resize-none overflow-hidden"
                          />
                          <Label htmlFor="address-detail" className="absolute left-4 top-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Địa chỉ cụ thể</Label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground font-medium">Loại địa chỉ:</p>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setAddrType("home")}
                            className={cn(
                              "flex-1 h-10 rounded-xl border-2 font-bold transition-all cursor-pointer flex items-center justify-center gap-2",
                              addrType === "home" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                            )}
                          >
                            Nhà Riêng
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddrType("office")}
                            className={cn(
                              "flex-1 h-10 rounded-xl border-2 font-bold transition-all cursor-pointer flex items-center justify-center gap-2",
                              addrType === "office" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                            )}
                          >
                            Văn Phòng
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => setIsAddrDialogOpen(false)}
                          className="px-8 h-12 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all cursor-pointer"
                        >
                          Trở Lại
                        </Button>
                        <Button
                          onClick={() => setIsAddrDialogOpen(false)}
                          className="px-10 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
                        >
                          Hoàn thành
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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

          {selectedItems.map((item) => {
            const src = getImageUrl(item.image) ?? item.image ?? undefined;
            return (
              <div key={item.id} className="px-6 py-4 border-b border-border/40">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 md:col-span-6 flex gap-3">
                    <div className="size-10 flex-shrink-0 bg-muted border border-border/60 rounded-sm overflow-hidden relative">
                      {src && (
                        <Image
                          src={src}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center max-w-[250px] md:max-w-none">
                      <p className="line-clamp-1 text-sm text-foreground mb-1">
                        {item.name}
                      </p>

                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 text-left md:text-center flex items-center justify-between md:justify-center">
                    <span className="md:hidden text-muted-foreground text-sm">Đơn giá:</span>
                    <span className="text-sm text-foreground">{formatVnd(item.price)}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2 text-left md:text-center flex items-center justify-between md:justify-center">
                    <span className="md:hidden text-muted-foreground text-sm">Số lượng:</span>
                    <span className="text-sm text-foreground">{item.quantity}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2 text-right font-medium text-sm text-foreground">
                    <span className="md:hidden text-muted-foreground float-left font-normal">Thành tiền:</span>
                    {formatVnd(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b border-border/40 text-sm">
            <div className="p-6 flex items-center gap-4 border-b border-border/40 md:border-b-0">
              <span className="whitespace-nowrap text-foreground">Lời nhắn:</span>
              <Input
                placeholder="Lưu ý cho Người bán..."
                className="flex-1 border-border/60 h-9 rounded-sm focus-visible:ring-1 focus-visible:ring-border/60 shadow-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="p-6 border-b border-border/40 bg-[#fafdff] dark:bg-muted/10">
            <div className="flex justify-end items-center gap-3">
              <span className="text-muted-foreground text-sm">Tổng số tiền ({totalQty} sản phẩm):</span>
              <span className="text-xl font-semibold text-primary">{formatVnd(subTotal)}</span>
            </div>
          </div>
        </div>

        <div className="bg-card shadow-sm rounded-sm border border-border/40 overflow-hidden text-sm">
          <div className="p-6 py-5 flex items-center justify-between border-b border-border/40">
            <div className="flex items-center gap-2">
              <Ticket className="size-5 text-primary" />
              <span className="text-foreground text-base">Voucher</span>
            </div>
            <CartVoucherPopover>
              <button className="text-blue-600 font-medium hover:underline text-sm cursor-pointer">
                Chọn nhập mã
              </button>
            </CartVoucherPopover>
          </div>
        </div>

        <div className="bg-card shadow-sm rounded-sm border border-border/40 overflow-hidden pb-6">
          <div className="p-6 border-b border-border/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="text-lg text-foreground font-bold">Phương thức thanh toán</div>
              <div className="flex flex-wrap gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPayment === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={cn(
                        "relative flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all cursor-pointer group",
                        isSelected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/30 text-muted-foreground"
                      )}
                    >
                      <Icon className={cn("size-5 transition-colors", isSelected ? "text-primary" : "group-hover:text-primary")} />
                      <span className="text-sm font-bold">{method.label}</span>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-primary text-white size-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
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
                  <div className="bg-primary/10 p-2 rounded-lg">
                    {(() => {
                      const method = PAYMENT_METHODS.find(m => m.id === selectedPayment);
                      const Icon = method?.icon || Banknote;
                      return <Icon className="size-5 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Phương thức đã chọn</p>
                    <p className="text-xs text-muted-foreground">
                      {PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  * Vui lòng kiểm tra lại thông tin đơn hàng trước khi xác nhận đặt hàng. <br />
                  * Bạn có thể thay đổi phương thức thanh toán bất cứ lúc nào trước khi nhấn "Đặt hàng".
                </p>
              </div>
              <div className="w-full md:w-[350px] space-y-3">


                <div className="pt-4  flex justify-between items-center">
                  <span className="text-base font-bold text-foreground">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-primary tracking-tight">
                    {formatVnd(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border/40 border-dashed flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground max-w-[600px] leading-relaxed">
              Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo <Link href="#" className="text-blue-600 hover:underline font-bold cursor-pointer">Điều khoản {siteConfig.name}</Link>
            </div>
            <Button className="w-full md:w-[260px] h-14 text-lg font-black rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase cursor-pointer">
              Đặt hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

