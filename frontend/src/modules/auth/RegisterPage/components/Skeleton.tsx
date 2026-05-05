import { Skeleton } from '@/components/ui/skeleton';

export function RegisterPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center overflow-hidden relative">
      <div className="w-full max-w-full xl:w-screen mx-4 my-4 sm:mx-6 xl:mx-36 bg-white shadow rounded-2xl grid grid-cols-1 xl:grid-cols-2 overflow-hidden">
        <div className="hidden xl:block rounded-l-2xl col-span-1 min-h-[480px] bg-gray-100" />
        <div className="px-4 py-6 col-span-1 xl:order-2 min-w-0">
          <div className="text-center mb-6">
            <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
            <Skeleton className="h-8 w-56 mx-auto" />
          </div>
          <div className="mx-auto w-full max-w-md space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-11 rounded-lg" />
              <Skeleton className="h-11 rounded-lg" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="h-28 flex-1 rounded-lg" />
              <Skeleton className="h-28 flex-1 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
