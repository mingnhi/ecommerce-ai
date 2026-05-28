import { Suspense } from 'react';
import SearchPage from '@/modules/SearchPage';
import { SearchPageSkeleton } from '@/modules/SearchPage/components/Skeleton';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({ 
  searchParams 
}: { 
  searchParams?: Promise<SearchParams> | SearchParams 
}) {
  const sp = (await searchParams) ?? {};
  const slow = typeof sp.slow === 'string' ? sp.slow : undefined;
  
  if (slow === '1') await sleep(800);

  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPage />
    </Suspense>
  );
}