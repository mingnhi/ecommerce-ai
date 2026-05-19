import { useEffect, useRef, useState } from "react";

export function useOrderTabsSticky() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const sync = () => {
      const sentinel = sentinelRef.current;
      if (!sentinel) return;

      const atPageTop = window.scrollY <= 1;
      const pinned = !atPageTop && sentinel.getBoundingClientRect().top <= 0;
      setIsPinned(pinned);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return { sentinelRef, isPinned };
}
