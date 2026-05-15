import React from 'react';
import { DefaultLayout } from '@/components/layouts/DefaultLayout';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
