function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 sm:p-4">
      <div className="aspect-square rounded-xl bg-slate-200" />
      <div className="flex flex-1 flex-col pt-3">
        <div className="h-3 w-16 rounded bg-slate-200" />
        <div className="mt-2 h-5 w-4/5 rounded bg-slate-200" />
        <div className="mt-auto flex items-end justify-between pt-4">
          <div className="h-6 w-20 rounded bg-slate-200" />
          <div className="size-10 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
