import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton() {
  return (
    <div className="min-h-[calc(100vh-66px)] bg-muted/25 py-6">
      {/* Header Skeleton */}
      <div className="border-b border-border/60 bg-background mb-6 -mt-6">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-4 sm:px-6">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-7 w-4" />
          <Skeleton className="h-7 w-24" />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] space-y-6">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[48px_minmax(220px,1fr)_112px_128px_112px_88px] gap-3 px-4 py-3.5 border-b border-border/50 bg-muted/30">
            <Skeleton className="size-[18px] mx-auto" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16 mx-auto" />
            <Skeleton className="h-5 w-16 mx-auto" />
            <Skeleton className="h-5 w-16 mx-auto" />
            <Skeleton className="h-5 w-16 mx-auto" />
          </div>

          {/* Table Rows */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-[48px_minmax(220px,1fr)_112px_128px_112px_88px] gap-3 px-4 py-4 border-b border-border/40 items-center">
              <Skeleton className="size-[18px] mx-auto" />
              <div className="flex gap-3">
                <Skeleton className="h-20 w-20 rounded-md" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 mx-auto" />
              <Skeleton className="h-8 w-24 mx-auto rounded-md" />
              <Skeleton className="h-5 w-16 mx-auto" />
              <Skeleton className="size-9 mx-auto rounded-md" />
            </div>
          ))}

          {/* Vouchers */}
          <div className="p-4 border-t border-border/50 bg-muted/15 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="flex justify-between items-center px-4 py-3 border-b border-border/50 bg-muted/15">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex justify-between items-center px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-[18px]" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-60" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
