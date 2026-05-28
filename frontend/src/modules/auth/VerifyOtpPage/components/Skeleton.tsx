import { Skeleton } from "@/components/ui/skeleton";

export function VerifyOtpPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-100/50 p-4 dark:bg-neutral-950 sm:p-6 lg:p-8">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-sky-500/60 bg-white shadow-[0_20px_50px_rgba(14,165,233,0.15)] dark:border-neutral-800 dark:bg-neutral-900">
        <Skeleton className="h-1.5 w-full rounded-none" />

        <div className="space-y-6 p-8 sm:p-10">
          <Skeleton className="h-4 w-36" />

          <div className="flex justify-center">
            <Skeleton className="size-16 rounded-2xl" />
          </div>

          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-8 w-48" />
            <Skeleton className="mx-auto h-4 w-64" />
            <Skeleton className="mx-auto h-7 w-56 rounded-full" />
          </div>

          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="mx-auto h-4 w-36" />
          <Skeleton className="mx-auto h-4 w-44" />
        </div>
      </div>
    </div>
  );
}
