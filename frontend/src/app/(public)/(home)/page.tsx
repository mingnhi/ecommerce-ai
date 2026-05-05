import { Suspense } from 'react';
import type { Metadata } from 'next';
import HomePage from '@/modules/HomePage';
import HomePageSkeleton from '@/modules/HomePage/components/Skeleton';
import { APP_URL, siteConfig } from '@/configs/site';

export const metadata: Metadata = {
  title: siteConfig.metaTitle,
  description: siteConfig.description,
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: siteConfig.metaTitle,
    description: siteConfig.description,
    url: APP_URL,
    siteName: siteConfig.name,
    images: [siteConfig.ogImage],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.metaTitle,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function Page() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePage />
    </Suspense>
  );
}

