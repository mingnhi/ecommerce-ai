'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { siteConfig } from '@/configs/site';

export function DefaultFooter() {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="mx-auto p-8 flex flex-col md:flex-row justify-between gap-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tracking-tight text-gray-900">
                            {siteConfig.name}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 max-w-xs">
                        {siteConfig.description}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-20">
                    <div>
                        <h3 className="text-gray-900 dark:text-gray-100 font-semibold mb-3 text-lg">Về chúng tôi</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-sky-600 transition hover:cursor-pointer">
                                    Giới thiệu
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-sky-600 transition hover:cursor-pointer">
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-gray-900 dark:text-gray-100 font-semibold mb-3 text-lg">Kết nối</h3>
                    <div className="flex items-center gap-4">
                        <Link href={siteConfig.facebook} className="text-gray-600 dark:text-gray-400 hover:text-sky-600 hover:cursor-pointer">
                            <Facebook className="h-6 w-6" />
                        </Link>
                        <Link href={siteConfig.twitter} className="text-gray-600 dark:text-gray-400 hover:text-sky-600 hover:cursor-pointer">
                            <Twitter className="h-6 w-6" />
                        </Link>
                        <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-sky-600 hover:cursor-pointer">
                            <Instagram className="h-6 w-6" />
                        </Link>
                        <Link href={siteConfig.linkedin} className="text-gray-600 dark:text-gray-400 hover:text-sky-600 hover:cursor-pointer">
                            <Linkedin className="h-6 w-6" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 py-4 text-center text-md" suppressHydrationWarning>
                © {currentYear ?? 2026} {siteConfig.name}. Mọi quyền được bảo lưu.
            </div>
        </footer>
    );
}
