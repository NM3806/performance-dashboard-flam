import { useEffect, useRef, useCallback, useState } from 'react';
import { DataPoint } from '@/lib/types';
import { generateStreamPoint } from '@/lib/dataGenerator';

import { globalPerfMetrics } from '@/hooks/usePerformanceMonitor';

const STREAM_INTERVAL_MS = 100;

interface UseDataStreamOptions {
  enabled: boolean;
  maxPoints: number;
  intervalMs?: number;
  batchSize?: number;
  onNewPoint?: (point: DataPoint) => void;
}

interface UseDataStreamResult {
  isStreaming: boolean;
}

// Hook that generates new data points and appends to data ref
export function useDataStream(
  dataRef: React.MutableRefObject<DataPoint[]>,
  options: UseDataStreamOptions
): UseDataStreamResult {
  const { enabled, maxPoints, intervalMs = 100, batchSize = 1, onNewPoint } = options;
  const [isStreaming, setIsStreaming] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    const t0 = performance.now();
    const data = dataRef.current;

    for (let i = 0; i < batchSize; i++) {
      const point = generateStreamPoint(Date.now());
      data.push(point);
      if (onNewPoint && i === batchSize - 1) {
        onNewPoint(point);
      }
    }

    // Trim from front if over limit (sliding window)
    if (data.length > maxPoints) {
      const excess = data.length - maxPoints;
      data.splice(0, excess);
    }

    globalPerfMetrics.dataProcessingTime = performance.now() - t0;
  }, [dataRef, maxPoints, batchSize, onNewPoint]);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(tick, intervalMs);
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
  }, [enabled, intervalMs, tick]);

  return { isStreaming };
}
