'use client';

import { useState, useEffect, useRef } from 'react';
import { getMemoryUsage } from '@/lib/performanceUtils';

export const globalPerfMetrics = {
  renderTime: 0,
  dataProcessingTime: 0,
};

interface UsePerformanceMonitorResult {
  fps: number;
  memoryUsage: number | null;
  renderTime: number;
  processingTime: number;
}

export function usePerformanceMonitor(): UsePerformanceMonitorResult {
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const [renderTime, setRenderTime] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    lastTimeRef.current = performance.now();

    function tick(now: number) {
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        setMemoryUsage(getMemoryUsage());
        setRenderTime(globalPerfMetrics.renderTime);
        setProcessingTime(globalPerfMetrics.dataProcessingTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { fps, memoryUsage, renderTime, processingTime };
}
