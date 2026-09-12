'use client';

import { useState, useEffect, useRef } from 'react';
import { getMemoryUsage } from '@/lib/performanceUtils';

// Global mutable metrics to avoid frequent react state updates across the app
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
  const lastTimeRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function tick() {
      const now = performance.now();
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
