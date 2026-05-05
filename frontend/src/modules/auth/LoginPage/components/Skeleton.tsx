import { Skeleton } from '@/components/ui/skeleton';

export function LoginPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center overflow-hidden relative">
      <div className="w-full max-w-full xl:w-screen mx-4 my-4 sm:mx-6 xl:mx-36 bg-white shadow rounded-2xl grid grid-cols-1 xl:grid-cols-2 overflow-hidden">
        <div className="px-4 py-6 col-span-1 min-w-0">
          <div className="text-center mb-6">
            <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
            <Skeleton className="h-8 w-64 mx-auto" />
          </div>
          <div className="mx-auto w-full max-w-md space-y-5">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        </div>
        <div className="hidden xl:block rounded-r-2xl col-span-1 min-h-[480px] bg-gray-100" />
      </div>
    </div>
  );
}
