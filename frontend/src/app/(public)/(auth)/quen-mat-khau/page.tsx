import { Suspense } from 'react';
import ForgotPasswordPage from '@/modules/auth/ForgotPasswordPage';
import { ForgotPasswordPageSkeleton } from '@/modules/auth/ForgotPasswordPage/components/Skeleton';

export default function Page() {
  return (
    <Suspense fallback={<ForgotPasswordPageSkeleton />}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
