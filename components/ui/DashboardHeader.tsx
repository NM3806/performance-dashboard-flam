'use client';

import { useData } from '@/components/providers/DataProvider';

export function DashboardHeader() {
  const { isStreaming, dataRef, dataVersion } = useData();

  // Read point count from ref (only when dataVersion changes)
  const pointCount = dataRef.current.length;

  return (
    <header className="dashboard-header">
      <h1>Performance Dashboard</h1>
      <div className="header-meta">
        <span className="live-indicator">
          <span className={`live-dot ${isStreaming ? 'active' : ''}`} />
          <span>{isStreaming ? 'LIVE' : 'PAUSED'}</span>
        </span>
        <span>{pointCount.toLocaleString()} pts</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
    </header>
  );
}
