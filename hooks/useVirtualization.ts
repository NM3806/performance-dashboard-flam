import { useState, useCallback, useRef, useMemo } from 'react';

interface UseVirtualizationOptions {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface UseVirtualizationResult {
  visibleRange: { start: number; end: number };
  totalHeight: number;
  offsetY: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useVirtualization(options: UseVirtualizationOptions): UseVirtualizationResult {
  const { itemCount, itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const totalHeight = itemCount * itemHeight;

  const visibleRange = useMemo(() => {
    const startIdx = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);

    const start = Math.max(0, startIdx - overscan);
    const end = Math.min(itemCount, startIdx + visibleCount + overscan);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

  const offsetY = visibleRange.start * itemHeight;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleRange,
    totalHeight,
    offsetY,
    onScroll,
    scrollContainerRef,
  };
}
