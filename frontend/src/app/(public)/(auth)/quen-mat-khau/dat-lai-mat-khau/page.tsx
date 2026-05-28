import { Suspense } from 'react';
import ResetPasswordPage from '@/modules/auth/ResetPasswordPage';
import { ResetPasswordPageSkeleton } from '@/modules/auth/ResetPasswordPage/components/Skeleton';

export default function Page() {
  return (
    <Suspense fallback={<ResetPasswordPageSkeleton />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
