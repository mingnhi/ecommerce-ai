import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@/stores';
import { setSuppressHeader } from '@/stores/layout/slice';
import { HEADER_HEIGHT } from '@/stores/layout/constants';

export function useOrderTabsSticky() {
  const dispatch = useAppDispatch();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const pinned = !entry.isIntersecting;
        setIsPinned(pinned);
        dispatch(setSuppressHeader(pinned));
      },
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px`, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      dispatch(setSuppressHeader(false));
    };
  }, [dispatch]);

  return { sentinelRef, isPinned };
}
