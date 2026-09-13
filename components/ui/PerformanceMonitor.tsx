'use client';

import React from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { formatMemory } from '@/lib/performanceUtils';
import { useMounted } from '@/hooks/useMounted';

const PerformanceMonitor = React.memo(function PerformanceMonitor() {
  const { fps, memoryUsage, renderTime, processingTime } = usePerformanceMonitor();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <footer className="perf-status-line" suppressHydrationWarning>
        <span>FPS —</span>
        <span className="status-sep">·</span>
        <span>Memory —</span>
        <span className="status-sep">·</span>
        <span>Render —</span>
        <span className="status-sep">·</span>
        <span>Processing —</span>
      </footer>
    );
  }

  const memText = formatMemory(memoryUsage);
  const renderText = renderTime > 0 ? `${renderTime.toFixed(1)} ms` : '—';
  const procText = processingTime > 0 ? `${processingTime.toFixed(1)} ms` : '—';

  return (
    <footer className="perf-status-line" suppressHydrationWarning>
      <span>FPS {fps > 0 ? fps : '—'}</span>
      <span className="status-sep">·</span>
      <span>Memory {memText}</span>
      <span className="status-sep">·</span>
      <span>Render {renderText}</span>
      <span className="status-sep">·</span>
      <span>Processing {procText}</span>
    </footer>
  );
});

export default PerformanceMonitor;
