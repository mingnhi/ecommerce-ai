import { useEffect, useState, type RefObject } from "react";

export function useInfiniteScroll<T>(
  items: T[],
  pageSize: number,
  sentinelRef: RefObject<HTMLElement | null>,
) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const hasMore = visibleCount < items.length;
  const visibleItems = items.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + pageSize, items.length));
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, items.length, pageSize, sentinelRef]);

  return { visibleItems, hasMore };
}
