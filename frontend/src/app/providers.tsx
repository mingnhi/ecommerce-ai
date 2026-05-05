'use client';

import { ReactNode, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { Provider as ReduxProvider } from 'react-redux';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import LayoutContainer from '@/components/layouts/LayoutContainer';
import Chatbot from '@/components/common/Chatbot';
import { AuthSessionSync } from '@/components/auth/AuthSessionSync';
import { useScrollToTop } from '@/hooks/use-scroll-to-top';
import { store } from '@/stores';

function ScrollToTop() {
  useScrollToTop();
  return null;
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false, // Don't refetch on mount if data is fresh
            refetchOnWindowFocus: false,
            refetchOnReconnect: true, // Refetch on reconnect to sync data
            retry: 1, // Retry once on failure
            staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
            gcTime: 1000 * 60 * 10, // Cache data for 10 minutes (formerly cacheTime)
        },
    },
});

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ReduxProvider store={store}>
            <SessionProvider>
                <AuthSessionSync />
                <QueryClientProvider client={queryClient}>
                    <Toaster position="top-center" richColors className="text-center [&_li]:justify-center" />
                    <Suspense fallback={null}>
                      <ScrollToTop />
                    </Suspense>
                    <LayoutContainer>{children}</LayoutContainer>
                    <NextTopLoader
                        color="oklch(0.7529 0.1271 234.97)"
                        initialPosition={0.08}
                        crawlSpeed={200}
                        height={2.3}
                        crawl={true}
                        showSpinner={false}
                        easing="ease"
                        speed={200}
                        shadow={false}
                    />
                    <Chatbot />
                </QueryClientProvider>
            </SessionProvider>
        </ReduxProvider>
    );
}