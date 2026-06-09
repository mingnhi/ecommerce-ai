function HeaderSkeleton() {
  return (
    <div className="mb-8 animate-pulse border-b border-slate-200 pb-8">
      <div className="mb-6 h-4 w-48 rounded bg-slate-200" />
      <div className="h-3 w-28 rounded bg-slate-200" />
      <div className="mt-3 h-9 w-72 max-w-full rounded bg-slate-200 sm:h-10" />
      <div className="mt-3 h-4 w-full max-w-xl rounded bg-slate-200" />
      <div className="mt-3 h-4 w-2/3 max-w-md rounded bg-slate-200" />
      <div className="mt-6 h-9 w-40 rounded-full bg-slate-200" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="aspect-square bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="flex items-end justify-between pt-2">
          <div className="h-6 w-24 rounded bg-slate-200" />
          <div className="size-9 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function GoiYSanPhamSkeleton({ withHeader = true }: { withHeader?: boolean }) {
  return (
    <>
      {withHeader ? <HeaderSkeleton /> : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
