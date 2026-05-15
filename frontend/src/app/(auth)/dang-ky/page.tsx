import { Suspense } from 'react';
import RegisterPage from '@/modules/auth/RegisterPage';
import { RegisterPageSkeleton } from '@/modules/auth/RegisterPage/components/Skeleton';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({ searchParams }: { searchParams?: Promise<SearchParams> | SearchParams }) {
  const sp = (await searchParams) ?? {};
  const slow = typeof sp.slow === 'string' ? sp.slow : undefined;
  if (slow === '1') await sleep(2000);

  return (
    <Suspense fallback={<RegisterPageSkeleton />}>
      <RegisterPage />
    </Suspense>
  );
}

