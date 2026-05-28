export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Image Skeleton */}
        <div>
          <div className="aspect-square rounded-3xl bg-slate-200 animate-pulse" />
          <div className="flex gap-4 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-20 h-20 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-7">
          <div className="space-y-3">
            <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 bg-slate-200 rounded w-4/5 animate-pulse" />
          </div>

          <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />

          <div className="h-12 w-40 bg-slate-200 rounded-2xl animate-pulse" />

          <div className="h-14 bg-slate-200 rounded-2xl animate-pulse" />

          <div className="pt-6 space-y-4">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}