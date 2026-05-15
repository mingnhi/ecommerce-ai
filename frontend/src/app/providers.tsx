'use client';

import { ReactNode, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { Provider as ReduxProvider } from 'react-redux';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import Chatbot from '@/components/common/Chatbot';
import { AuthSessionSync } from '@/components/auth/AuthSessionSync';
import { useScrollToTop } from '@/hooks/use-scroll-to-top';
import { useInitWishlist } from '@/hooks/use-wishlist';
import { store } from '@/stores';

function GlobalHooks() {
  useScrollToTop();
  useInitWishlist();
  return null;
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
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
                      <GlobalHooks />
                    </Suspense>
                    {children}
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