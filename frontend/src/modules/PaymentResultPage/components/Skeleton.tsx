import { Skeleton } from '@/components/ui/skeleton';

export function PaymentResultSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-66px)] items-center justify-center bg-slate-50/80 px-4 py-7 sm:px-6">
      <div className="w-full max-w-[min(100%,36rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm sm:max-w-xl">
        <div className="space-y-4 border-b border-slate-100 bg-sky-50/40 px-10 pb-8 pt-10 text-center">
          <Skeleton className="mx-auto h-3 w-20" />
          <Skeleton className="mx-auto size-16 rounded-full" />
          <Skeleton className="mx-auto h-7 w-52" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
        <div className="space-y-4 px-10 py-8">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-lg" />
         
        </div>
      </div>
    </div>
  );
}
