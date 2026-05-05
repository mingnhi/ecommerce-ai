'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    home?: { href?: string };
}

export function Breadcrumb({ items, home }: BreadcrumbProps) {
    return (
        <nav className="flex items-center space-x-1 text-sm text-gray-500" aria-label="Breadcrumb">
            {home && (
                <Link
                    href={home.href || '/'}
                    className="flex items-center hover:text-gray-700 transition-colors"
                >
                    <Home className="h-4 w-4" />
                </Link>
            )}
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-gray-700 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

