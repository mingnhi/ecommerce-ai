import { Suspense } from 'react';
import VerifyOtpPage from '@/modules/auth/VerifyOtpPage';
import { VerifyOtpPageSkeleton } from '@/modules/auth/VerifyOtpPage/components/Skeleton';

export default function Page() {
  return (
    <Suspense fallback={<VerifyOtpPageSkeleton />}>
      <VerifyOtpPage />
    </Suspense>
  );
}
