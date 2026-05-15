import { Skeleton } from "@/components/ui/skeleton";

export function OrderHistorySkeleton() {
  return (
    <div className="min-h-auto py-6">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>

          <Skeleton className="h-12 w-full" />

          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-border/60 bg-card">
                <Skeleton className="h-14 w-full" />
                <div className="p-4">
                  <div className="flex gap-3">
                    <Skeleton className="size-20 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
