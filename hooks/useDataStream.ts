import { useEffect, useRef, useCallback } from 'react';
import { DataPoint } from '@/lib/types';
import { generateStreamPoint } from '@/lib/dataGenerator';

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

export function useDataStream(
  dataRef: React.MutableRefObject<DataPoint[]>,
  options: UseDataStreamOptions
): UseDataStreamResult {
  const { enabled, maxPoints, intervalMs = 100, batchSize = 1, onNewPoint } = options;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    const data = dataRef.current;

    for (let i = 0; i < batchSize; i++) {
      const point = generateStreamPoint(Date.now());
      data.push(point);
      if (onNewPoint && i === batchSize - 1) {
        onNewPoint(point);
      }
    }

    if (data.length > maxPoints) {
      data.splice(0, data.length - maxPoints);
    }
  }, [dataRef, maxPoints, batchSize, onNewPoint]);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(tick, intervalMs);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, tick]);

  return { isStreaming: enabled };
}
