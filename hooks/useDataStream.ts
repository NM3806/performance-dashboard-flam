import { useEffect, useRef, useCallback, useState } from 'react';
import { DataPoint } from '@/lib/types';
import { generateStreamPoint } from '@/lib/dataGenerator';

import { globalPerfMetrics } from '@/hooks/usePerformanceMonitor';

const STREAM_INTERVAL_MS = 100;

interface UseDataStreamOptions {
  enabled: boolean;
  maxPoints: number;
  onNewPoint?: (point: DataPoint) => void;
}

interface UseDataStreamResult {
  isStreaming: boolean;
}

// Hook that generates new data points every 100ms and appends to data ref
export function useDataStream(
  dataRef: React.MutableRefObject<DataPoint[]>,
  options: UseDataStreamOptions
): UseDataStreamResult {
  const { enabled, maxPoints, onNewPoint } = options;
  const [isStreaming, setIsStreaming] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    const t0 = performance.now();
    const point = generateStreamPoint(Date.now());
    const data = dataRef.current;

    // Append new point
    data.push(point);

    // Trim from front if over limit (sliding window)
    if (data.length > maxPoints) {
      const excess = data.length - maxPoints;
      data.splice(0, excess);
    }

    if (onNewPoint) {
      onNewPoint(point);
    }
    globalPerfMetrics.dataProcessingTime = performance.now() - t0;
  }, [dataRef, maxPoints, onNewPoint]);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(tick, STREAM_INTERVAL_MS);
      setIsStreaming(true);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsStreaming(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, tick]);

  return { isStreaming };
}
