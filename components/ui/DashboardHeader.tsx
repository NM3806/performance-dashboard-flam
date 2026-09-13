'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/components/providers/DataProvider';

export function DashboardHeader() {
  const { isStreaming, dataRef, dataVersion } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="dashboard-header">
        <h1 className="header-title">Time Series Dataset</h1>
        <div className="header-meta">
          <span>— points</span>
          <span className="meta-dot">·</span>
          <span className="live-indicator">
            <span className="live-dot" />
            <span>CONNECTING</span>
          </span>
        </div>
      </header>
    );
  }

  // Read point count from ref (only when dataVersion changes)
  const pointCount = dataRef.current.length;

  return (
    <header className="dashboard-header">
      <h1 className="header-title">Time Series Dataset</h1>
      <div className="header-meta">
        <span className="mono">{pointCount.toLocaleString()} points</span>
        <span className="meta-dot">·</span>
        <span className="live-indicator">
          <span className={`live-dot ${isStreaming ? 'live' : 'paused'}`} />
          <span>{isStreaming ? 'LIVE' : 'PAUSED'}</span>
        </span>
      </div>
    </header>
  );
}
