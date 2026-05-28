export default function HomePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] animate-pulse space-y-10 px-4 py-8 md:space-y-12 md:px-6 md:py-8">
      {/* Hero Skeleton */}
      <div className="h-[380px] rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200" />

      {/* Category Skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-36 w-28 shrink-0 rounded-2xl bg-slate-200" />
        ))}
      </div>

      {/* Deal & DailyBest Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl bg-slate-200" />
        ))}
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
