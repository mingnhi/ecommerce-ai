'use client';

import React from 'react';
import { DefaultHeader } from './DefaultHeader';
import { DefaultFooter } from './DefaultFooter';
interface DefaultLayoutProps {
    children: React.ReactNode;
}

export function DefaultLayout({ children }: DefaultLayoutProps) {
    return (
        <>
            <DefaultHeader />
            <div className="bg-white">
                <main className="mt-[60px] bg-white">
                    {children}
                </main>
            </div>
            <DefaultFooter />
        </>
    );
}
