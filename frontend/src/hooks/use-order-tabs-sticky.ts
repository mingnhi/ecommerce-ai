import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '@/stores';
import { setSuppressHeader } from '@/stores/layout/slice';
import { HEADER_HEIGHT } from '@/stores/layout/constants';

export function useOrderTabsSticky() {
  const dispatch = useAppDispatch();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const sync = () => {
      const sentinel = sentinelRef.current;
      if (!sentinel) return;

      const atPageTop = window.scrollY <= 1;
      const pinned = !atPageTop && sentinel.getBoundingClientRect().top <= 0;

      setIsPinned(pinned);
      dispatch(setSuppressHeader(pinned));
    };

    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      dispatch(setSuppressHeader(false));
    };
  }, [dispatch]);

  return { sentinelRef, isPinned };
}
