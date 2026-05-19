import { Skeleton } from "@/components/ui/skeleton";

export function PaymentResultSkeleton() {
  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6">
        <div className="flex gap-4">
          <Skeleton className="size-11 shrink-0 rounded-sm" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-7 w-3/4 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
        <div className="overflow-hidden rounded-sm border border-border/60 bg-card">
          <div className="flex justify-between gap-4 border-b border-border/50 px-5 py-4 sm:px-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-4 border-t border-border/50 px-5 py-5 sm:px-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="size-14 shrink-0 rounded-sm sm:size-16" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 border-t border-border/50 px-5 py-5 sm:flex-row sm:px-6">
            <Skeleton className="h-11 flex-1 rounded-sm" />
            <Skeleton className="h-11 flex-1 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
