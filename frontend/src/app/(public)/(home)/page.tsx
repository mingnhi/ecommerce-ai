import { Suspense } from 'react';
import HomePage from '@/modules/HomePage';
import HomePageSkeleton from '@/modules/HomePage/components/Skeleton';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({ 
  searchParams 
}: { 
  searchParams?: Promise<SearchParams> | SearchParams 
}) {
  const sp = (await searchParams) ?? {};
  const slow = typeof sp.slow === 'string' ? sp.slow : undefined;
  
  // Dùng để test loading state (xóa sau khi dev xong)
  if (slow === '1') await sleep(1500);

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePage />
    </Suspense>
  );
}
