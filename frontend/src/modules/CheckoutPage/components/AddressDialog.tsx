"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  type CheckoutAddress,
  formatProvinceLabel,
  formatWardLabel,
  fromUiAddressType,
  toCheckoutAddress,
  toUiAddressType,
} from "@/lib/checkout";
import {
  type Province,
  type Ward,
  useProvinces,
  useSaveAddress,
  useWards,
} from "@/apis/address";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedAddress: CheckoutAddress;
  onSaved: (address: CheckoutAddress) => void;
}

export function AddressDialog({
  open,
  onOpenChange,
  savedAddress,
  onSaved,
}: AddressDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [detail, setDetail] = useState("");
  const [addrType, setAddrType] = useState<"home" | "office">("home");
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);
  const [isKhuVucOpen, setIsKhuVucOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("province");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: provincesData, isLoading: provincesLoading } = useProvinces();
  const { data: wardsData, isLoading: wardsLoading } = useWards(provinceId);
  const provinces: Province[] = provincesData ?? [];
  const wards: Ward[] = wardsData ?? [];
  const saveAddress = useSaveAddress();

  useEffect(() => {
    if (!open) return;
    setName(savedAddress.name);
    setPhone(savedAddress.phone);
    setDetail(savedAddress.addressLine);
    setAddrType(toUiAddressType(savedAddress.type));
    setProvinceId(savedAddress.provinceId > 0 ? savedAddress.provinceId : null);
    setWardId(savedAddress.wardId > 0 ? savedAddress.wardId : null);
    setActiveTab("province");
  }, [open, savedAddress]);

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.id === provinceId),
    [provinces, provinceId],
  );

  const selectedWard = useMemo(
    () => wards.find((w) => w.id === wardId),
    [wards, wardId],
  );

  const khuVucLabel = useMemo(() => {
    if (!selectedProvince || !selectedWard) {
      return "Tỉnh/Thành phố, Phường/Xã";
    }
    return `${formatProvinceLabel(selectedProvince)}, ${formatWardLabel(selectedWard)}`;
  }, [selectedProvince, selectedWard]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDetail(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [open, detail]);

  const handleProvincePick = (id: number) => {
    setProvinceId(id);
    setWardId(null);
    setActiveTab("ward");
  };

  const handleComplete = async () => {
    if (!provinceId || !wardId) return;

    const payload = {
      fullName: name.trim(),
      phone: phone.trim(),
      addressLine: detail.trim(),
      provinceId,
      wardId,
      type: fromUiAddressType(addrType),
    };

    const saved = await saveAddress.mutateAsync({
      id: savedAddress.id,
      data: payload,
    });

    if (!saved) return;

    onSaved(toCheckoutAddress(saved));
    toast.success(savedAddress.id ? "Cập nhật địa chỉ thành công" : "Lưu địa chỉ thành công");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors cursor-pointer hover:underline"
        >
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Họ và tên"
                  className="h-14 pt-4 pb-1 px-4 border-muted-foreground/30 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all rounded-lg font-medium"
                />
                <Label
                  htmlFor="fullname"
                  className="absolute left-4 top-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider"
                >
                  Họ và tên
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại"
                  className="h-14 pt-4 pb-1 px-4 border-muted-foreground/30 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all rounded-lg font-medium"
                />
                <Label
                  htmlFor="phone"
                  className="absolute left-4 top-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider"
                >
                  Số điện thoại
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Popover open={isKhuVucOpen} onOpenChange={setIsKhuVucOpen} modal>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between h-14 pt-4 pb-1 px-4 border border-muted-foreground/30 focus:ring-1 focus:ring-sky-500/20 focus:border-sky-500 rounded-lg font-medium text-left bg-background transition-all outline-none"
                  >
                    <span
                      className={cn(
                        khuVucLabel === "Tỉnh/Thành phố, Phường/Xã"
                          ? "text-muted-foreground/50"
                          : "text-foreground",
                      )}
                    >
                      {khuVucLabel}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground/60 rotate-90" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[calc(600px-64px)] h-[300px] p-0 shadow-2xl border-none rounded-xl overflow-hidden"
                  align="start"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <div className="flex h-full flex-col bg-background">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="min-h-0 flex flex-1 flex-col"
                    >
                      <TabsList className="w-full h-12 bg-transparent border-b rounded-t-xl p-0">
                        <TabsTrigger
                          value="province"
                          className="flex-1 h-full rounded-t-xl border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent data-[state=active]:text-sky-600 font-bold text-sm"
                        >
                          Tỉnh/Thành phố
                        </TabsTrigger>
                        <TabsTrigger
                          value="ward"
                          disabled={provinceId == null}
                          className="flex-1 h-full rounded-t-xl border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent data-[state=active]:text-sky-600 font-bold text-sm"
                        >
                          Phường/Xã
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="province" className="relative m-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full" type="always">
                          <div className="p-2 pr-4">
                            {provincesLoading ? (
                              <p className="px-4 py-3 text-sm text-muted-foreground">Đang tải...</p>
                            ) : provinces.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-muted-foreground">
                                Chưa có dữ liệu tỉnh/thành
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-1">
                                {provinces.map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleProvincePick(p.id)}
                                    className={cn(
                                      "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-all hover:bg-sky-500/5",
                                      provinceId === p.id
                                        ? "bg-sky-500/5 font-bold text-sky-600"
                                        : "text-foreground/80",
                                    )}
                                  >
                                    <span>{formatProvinceLabel(p)}</span>
                                    {provinceId === p.id && <Check className="size-4" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <ScrollBar orientation="vertical" className="z-50" />
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="ward" className="relative m-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full" type="always">
                          <div className="p-2 pr-4">
                            {wardsLoading ? (
                              <p className="px-4 py-3 text-sm text-muted-foreground">Đang tải...</p>
                            ) : wards.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-muted-foreground">
                                Chưa có dữ liệu phường/xã
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-1">
                                {wards.map((w) => (
                                  <button
                                    key={w.id}
                                    type="button"
                                    onClick={() => {
                                      setWardId(w.id);
                                      setIsKhuVucOpen(false);
                                    }}
                                    className={cn(
                                      "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-all hover:bg-sky-500/5",
                                      wardId === w.id
                                        ? "bg-sky-500/5 font-bold text-sky-600"
                                        : "text-foreground/80",
                                    )}
                                  >
                                    <span>{formatWardLabel(w)}</span>
                                    {wardId === w.id && <Check className="size-4" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <ScrollBar orientation="vertical" className="z-50" />
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </PopoverContent>
              </Popover>
              <Label className="absolute left-4 top-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider z-10 pointer-events-none">
                Tỉnh/Thành phố, Phường/Xã
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Textarea
                id="address-detail"
                ref={textareaRef}
                value={detail}
                placeholder="Địa chỉ cụ thể"
                onChange={handleTextareaChange}
                className="min-h-[10px] pt-5 px-4 border-muted-foreground/30 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all rounded-lg font-medium resize-none overflow-hidden"
              />
              <Label
                htmlFor="address-detail"
                className="absolute left-4 top-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider"
              >
                Địa chỉ cụ thể
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium">Loại địa chỉ:</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setAddrType("home")}
                className={cn(
                  "flex-1 h-10 rounded-xl border-2 font-bold transition-all cursor-pointer flex items-center justify-center gap-2 hover:cursor-pointer",
                  addrType === "home"
                    ? "border-sky-500 bg-sky-500/5 text-sky-600"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                Nhà Riêng
              </button>
              <button
                type="button"
                onClick={() => setAddrType("office")}
                className={cn(
                  "flex-1 h-10 rounded-xl border-2 font-bold transition-all cursor-pointer flex items-center justify-center gap-2 hover:cursor-pointer",
                  addrType === "office"
                    ? "border-sky-500 bg-sky-500/5 text-sky-600"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                Văn Phòng
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="px-8 h-12 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all cursor-pointer hover:cursor-pointer"
            >
              Trở Lại
            </Button>
            <Button
              onClick={handleComplete}
              disabled={
                saveAddress.isPending ||
                !name.trim() ||
                !phone.trim() ||
                !detail.trim() ||
                !provinceId ||
                !wardId
              }
              className="px-10 h-12 rounded-xl font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-600/20 transition-all active:scale-95 cursor-pointer hover:cursor-pointer disabled:opacity-50"
            >
              {saveAddress.isPending ? "Đang lưu..." : "Hoàn thành"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
