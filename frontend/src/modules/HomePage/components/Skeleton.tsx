function SectionTitleSkeleton() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="h-7 w-40 rounded-md bg-slate-200" />
      <div className="h-4 w-20 rounded bg-slate-200" />
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 sm:p-4">
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

export default function HomePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] animate-pulse space-y-10 px-4 py-8 md:space-y-12 md:px-6 md:py-8">
      <div className="min-h-[420px] rounded-2xl border border-sky-100 bg-sky-50 lg:min-h-[400px]" />

      <section>
        <SectionTitleSkeleton />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-32 w-24 shrink-0 rounded-2xl border border-sky-100 bg-slate-200 sm:h-36 sm:w-28"
            />
          ))}
        </div>
      </section>

      <section>
        <SectionTitleSkeleton />
        <div className="mb-4 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-20 shrink-0 rounded-full bg-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
          <SectionTitleSkeleton />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
          <SectionTitleSkeleton />
          <div className="mb-4 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-12 rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>

      <section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-28 rounded bg-slate-200" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex gap-3 rounded-xl border border-slate-100 bg-white p-2">
                    <div className="size-16 shrink-0 rounded-lg bg-slate-200" />
                    <div className="flex flex-1 flex-col justify-center gap-2 py-1">
                      <div className="h-3 w-full rounded bg-slate-200" />
                      <div className="h-4 w-16 rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-36 rounded-2xl border border-sky-100 bg-sky-50 md:h-40" />
    </div>
  );
}
