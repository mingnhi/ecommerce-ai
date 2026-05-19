"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Check } from "lucide-react";
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
import { MOCK_PROVINCES, MOCK_WARDS } from "@/faker/mock-address";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress: {
    name: string;
    phone: string;
    address: string;
  };
  onUpdate: (address: { name: string; phone: string; address: string }) => void;
}

export function AddressDialog({ open, onOpenChange, initialAddress, onUpdate }: AddressDialogProps) {
  const [name, setName] = useState(initialAddress.name);
  const [phone, setPhone] = useState(initialAddress.phone);
  const [detail, setDetail] = useState("");
  const [addrType, setAddrType] = useState("home");
  const [province, setProvince] = useState("danang");
  const [ward, setWard] = useState("dn-1");
  const [isKhuVucOpen, setIsKhuVucOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("province");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse initial address to pre-fill detail if needed (simplified for mock)
  useEffect(() => {
    if (open) {
      setName(initialAddress.name);
      setPhone(initialAddress.phone);
      // For simplicity, we just keep the current detail or reset
    }
  }, [open, initialAddress]);

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
  }, [open]);

  const selectedProvinceLabel = MOCK_PROVINCES.find(p => p.id === province)?.name;
  const selectedWardLabel = MOCK_WARDS[province]?.find(w => w.id === ward)?.name;
  const khuVucLabel = selectedProvinceLabel && selectedWardLabel
    ? `${selectedProvinceLabel}, ${selectedWardLabel}`
    : "Tỉnh/Thành Phố, Quận/Huyện";

  const handleComplete = () => {
    const fullAddress = `${detail}${detail ? ", " : ""}${khuVucLabel}`;
    onUpdate({
      name,
      phone,
      address: fullAddress,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors cursor-pointer hover:underline">
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
                <Label htmlFor="fullname" className="absolute left-4 top-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Họ và tên</Label>
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
                    className="w-full flex items-center justify-between h-14 pt-4 pb-1 px-4 border border-muted-foreground/30 focus:ring-1 focus:ring-sky-500/20 focus:border-sky-500 rounded-lg font-medium text-left bg-background transition-all outline-none"
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
                          className="flex-1 h-full rounded-t-xl border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent data-[state=active]:text-sky-600 font-bold text-sm"
                        >
                          Tỉnh/Thành Phố
                        </TabsTrigger>

                        <TabsTrigger
                          value="ward"
                          disabled={!province}
                          className="flex-1 h-full rounded-t-xl border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent data-[state=active]:text-sky-600 font-bold text-sm"
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
                                    "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-all hover:bg-sky-500/5",
                                    province === p.id
                                      ? "bg-sky-500/5 font-bold text-sky-600"
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
                                    "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-all hover:bg-sky-500/5",
                                    ward === w.id
                                      ? "bg-sky-500/5 font-bold text-sky-600"
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
                value={detail}
                placeholder="Địa chỉ cụ thể"
                onChange={handleTextareaChange}
                className="min-h-[10px] pt-5 px-4 border-muted-foreground/30 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all rounded-lg font-medium resize-none overflow-hidden"
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
                  "flex-1 h-10 rounded-xl border-2 font-bold transition-all cursor-pointer flex items-center justify-center gap-2 hover:cursor-pointer",
                  addrType === "home" ? "border-sky-500 bg-sky-500/5 text-sky-600" : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                Nhà Riêng
              </button>
              <button
                type="button"
                onClick={() => setAddrType("office")}
                className={cn(
                  "flex-1 h-10 rounded-xl border-2 font-bold transition-all cursor-pointer flex items-center justify-center gap-2 hover:cursor-pointer",
                  addrType === "office" ? "border-sky-500 bg-sky-500/5 text-sky-600" : "border-border text-muted-foreground hover:bg-muted"
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
              className="px-10 h-12 rounded-xl font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/20 transition-all active:scale-95 cursor-pointer hover:cursor-pointer"
            >
              Hoàn thành
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
