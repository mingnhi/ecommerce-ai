import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSkeleton() {
  return (
    <div className="min-h-[calc(100vh-66px)] py-6">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 space-y-4">
        {/* Address Skeleton */}
        <div className="bg-card shadow-sm rounded-sm overflow-hidden border border-border/40 relative">
          <div className="h-[3px] w-full bg-muted" />
          <div className="p-6 md:p-7 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-6 w-60" />
              <Skeleton className="h-6 flex-1" />
            </div>
          </div>
        </div>

        {/* Product Skeleton */}
        <div className="bg-card shadow-sm rounded-sm border border-border/40 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/50">
            <Skeleton className="col-span-6 h-6 w-32" />
            <Skeleton className="col-span-2 h-6" />
            <Skeleton className="col-span-2 h-6" />
            <Skeleton className="col-span-2 h-6" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="px-6 py-4 border-b border-border/40">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="col-span-6 flex gap-3">
                  <Skeleton className="size-10 rounded-sm" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="col-span-2 h-4" />
                <Skeleton className="col-span-2 h-4" />
                <Skeleton className="col-span-2 h-4" />
              </div>
            </div>
          ))}
          <div className="p-6 border-b border-border/40">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="p-6 border-b border-border/40 bg-[#fafdff]">
            <div className="flex justify-end items-center gap-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </div>

        {/* Voucher Skeleton */}
        <div className="bg-card shadow-sm rounded-sm border border-border/40 overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* Payment Skeleton */}
        <div className="bg-card shadow-sm rounded-sm border border-border/40 overflow-hidden">
          <div className="p-6 border-b border-border/40">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <Skeleton className="h-7 w-48" />
              <div className="flex gap-3">
                <Skeleton className="h-12 w-40 rounded-xl" />
                <Skeleton className="h-12 w-40 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="px-6 py-8 border-b border-border/40 bg-muted/5">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Skeleton className="flex-1 h-24" />
              <Skeleton className="w-full md:w-[350px] h-32" />
            </div>
          </div>
          <div className="p-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <Skeleton className="h-5 w-full md:w-[400px]" />
            <Skeleton className="w-full md:w-[260px] h-14 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
