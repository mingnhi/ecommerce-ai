import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent } from "@/shared/components/ui/card";

interface PageSkeletonProps {
  filterCount?: number;
  rowCount?: number;
  columnCount?: number;
}

export function PageSkeleton({
  filterCount = 1,
  rowCount = 8,
  columnCount = 4,
}: PageSkeletonProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-sm" />
      </div>

      <div className="space-y-5">
        {/* Toolbar card skeleton */}
        <Card className="rounded-sm border-sky-500/20 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-sky-500/5">
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-sm" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <div
              className={
                filterCount === 2 ? "grid sm:grid-cols-2 gap-3" : "grid gap-3"
              }
            >
              {Array.from({ length: filterCount }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table skeleton */}
        <div className="rounded-sm border border-sky-500/20 overflow-hidden ring-1 ring-sky-500/5">
          {/* Header row */}
          <div className="flex gap-4 px-4 py-3 bg-sky-500/[0.06] border-b border-sky-500/15">
            {Array.from({ length: columnCount }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{ width: i === 0 ? "35%" : `${55 / (columnCount - 1)}%` }}
              />
            ))}
          </div>

          {/* Data rows */}
          {Array.from({ length: rowCount }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="flex gap-4 px-4 py-3.5 border-b border-sky-500/10 last:border-0"
            >
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <Skeleton
                  key={colIdx}
                  className="h-4"
                  style={{
                    width:
                      colIdx === 0
                        ? `${28 + (rowIdx % 3) * 8}%`
                        : `${40 / (columnCount - 1) + (colIdx % 2) * 5}%`,
                    opacity: 1 - rowIdx * 0.07,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between rounded-sm border border-sky-500/20 px-4 py-3.5 ring-1 ring-sky-500/5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-1.5">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
