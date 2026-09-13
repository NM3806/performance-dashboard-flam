'use client';

import { useData } from '@/components/providers/DataProvider';
import { useMounted } from '@/hooks/useMounted';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

export function DashboardHeader() {
  const { isStreaming, totalPoints } = useData();
  const { fps } = usePerformanceMonitor();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <header className="dashboard-header">
        <h1 className="header-title">Time Series Dataset</h1>
        <div className="header-meta">
          <span suppressHydrationWarning>— points</span>
          <span className="meta-dot">·</span>
          <span suppressHydrationWarning>— FPS</span>
          <span className="meta-dot">·</span>
          <span className="live-indicator">
            <span className="live-dot" />
            <span>CONNECTING</span>
          </span>
        </div>
      </header>
    );
  }

  return (
    <header className="dashboard-header">
      <h1 className="header-title">Time Series Dataset</h1>
      <div className="header-meta">
        <span className="mono" suppressHydrationWarning>{totalPoints.toLocaleString()} points</span>
        <span className="meta-dot">·</span>
        <span className="mono" suppressHydrationWarning>{fps > 0 ? `${fps} FPS` : '— FPS'}</span>
        <span className="meta-dot">·</span>
        <span className="live-indicator">
          <span className={`live-dot ${isStreaming ? 'live' : 'paused'}`} />
          <span>{isStreaming ? 'LIVE' : 'PAUSED'}</span>
        </span>
      </div>
    </header>
  );
}
