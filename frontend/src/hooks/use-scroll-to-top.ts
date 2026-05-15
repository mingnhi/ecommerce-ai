import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevRef = useRef('');

  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`;
    if (key === prevRef.current) return;
    prevRef.current = key;
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname, searchParams]);
}
