import { Skeleton } from '@/components/ui/skeleton';

export function VerifyOtpPageSkeleton() {
  return (
    <div className="min-h-screen bg-sky-100/50 dark:bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[520px] bg-white dark:bg-neutral-900 border border-sky-500/60 dark:border-neutral-800 rounded-[2rem] shadow-[0_20px_50px_rgba(14,165,233,0.15)] overflow-hidden">
        <Skeleton className="h-1.5 w-full rounded-none" />
        <div className="p-8 sm:p-10 space-y-6">
          <div className="flex justify-center">
            <Skeleton className="size-16 rounded-2xl" />
          </div>
          <div className="space-y-2 text-center">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-7 w-56 mx-auto rounded-full" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-4 w-36 mx-auto" />
          <Skeleton className="h-4 w-44 mx-auto" />
        </div>
      </div>
    </div>
  );
}
