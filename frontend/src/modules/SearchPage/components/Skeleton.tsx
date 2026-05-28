export function SearchPageSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-3 sm:p-4 animate-pulse"
        >
          <div className="relative aspect-square rounded-xl bg-slate-200" />
          <div className="flex flex-1 flex-col pt-3">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="mt-2 h-5 bg-slate-200 rounded w-4/5" />
            <div className="mt-1 h-3 w-12 bg-slate-200 rounded" />
            <div className="mt-auto pt-4 flex justify-between items-end">
              <div className="space-y-1">
                <div className="h-6 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-14 bg-slate-200 rounded" />
              </div>
              <div className="h-10 w-10 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}