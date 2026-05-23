import { Skeleton } from '@/components/ui/skeleton';

export function LoginPageSkeleton() {
  return (
    <div className="min-h-screen bg-sky-100/50 dark:bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[960px] bg-white dark:bg-neutral-900 border border-sky-500/60 dark:border-neutral-800 rounded-[2rem] shadow-[0_20px_50px_rgba(14,165,233,0.05)] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[580px]">
        <div className="hidden md:flex bg-sky-50/30 dark:bg-sky-950/10 border-r border-sky-100/50 dark:border-neutral-800 flex-col items-center justify-center p-8 gap-4">
          <Skeleton className="h-20 w-48 rounded-lg" />
          <Skeleton className="h-64 w-64 rounded-2xl" />
        </div>
        <div className="p-7 lg:p-9 flex flex-col justify-center">
          <div className="w-full max-w-[320px] mx-auto space-y-6">
            <div className="md:hidden flex justify-center">
              <Skeleton className="h-14 w-40 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
