'use client';

import React from 'react';
import { DefaultHeader } from './DefaultHeader';
import { DefaultFooter } from './DefaultFooter';
import { useAppSelector } from '@/stores';
import { selectSuppressHeader } from '@/stores/layout/selectors';
import { HEADER_HEIGHT } from '@/stores/layout/constants';

interface DefaultLayoutProps {
    children: React.ReactNode;
}

export function DefaultLayout({ children }: DefaultLayoutProps) {
    const suppressHeader = useAppSelector(selectSuppressHeader);

    return (
        <>
            <DefaultHeader />
            <div className="bg-white">
                <main
                    className="bg-white transition-[margin-top] duration-200"
                    style={{ marginTop: suppressHeader ? 0 : HEADER_HEIGHT }}
                >
                    {children}
                </main>
            </div>
            <DefaultFooter />
        </>
    );
}
