'use client';

import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useData } from '@/components/providers/DataProvider';
import { formatMemory } from '@/lib/performanceUtils';

const PerformanceMonitor = React.memo(function PerformanceMonitor() {
  const { fps, memoryUsage, renderTime, processingTime } = usePerformanceMonitor();
  const { dataRef } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <footer className="perf-footer">
        <div className="perf-metric">
          <span className="perf-metric-label">FPS</span>
          <span className="perf-metric-value mono">—</span>
        </div>
        <div className="perf-metric">
          <span className="perf-metric-label">Memory</span>
          <span className="perf-metric-value mono">—</span>
        </div>
        <div className="perf-metric">
          <span className="perf-metric-label">Render</span>
          <span className="perf-metric-value mono">—</span>
        </div>
        <div className="perf-metric">
          <span className="perf-metric-label">Processing</span>
          <span className="perf-metric-value mono">—</span>
        </div>
        <div className="perf-metric">
          <span className="perf-metric-label">Points</span>
          <span className="perf-metric-value mono">—</span>
        </div>
      </footer>
    );
  }

  const pointCount = dataRef.current ? dataRef.current.length : 0;

  return (
    <footer className="perf-footer">
      <div className="perf-metric">
        <span className="perf-metric-label">FPS</span>
        <span className="perf-metric-value mono">{fps > 0 ? fps : '—'}</span>
      </div>
      <div className="perf-metric">
        <span className="perf-metric-label">Memory</span>
        <span className="perf-metric-value mono">{formatMemory(memoryUsage)}</span>
      </div>
      <div className="perf-metric">
        <span className="perf-metric-label">Render</span>
        <span className="perf-metric-value mono">{renderTime > 0 ? `${renderTime.toFixed(1)}ms` : '—'}</span>
      </div>
      <div className="perf-metric">
        <span className="perf-metric-label">Processing</span>
        <span className="perf-metric-value mono">{processingTime > 0 ? `${processingTime.toFixed(1)}ms` : '—'}</span>
      </div>
      <div className="perf-metric">
        <span className="perf-metric-label">Points</span>
        <span className="perf-metric-value mono">{pointCount > 0 ? pointCount.toLocaleString() : '—'}</span>
      </div>
    </footer>
  );
});

export default PerformanceMonitor;
