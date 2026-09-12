'use client';

import React from 'react';
import { useData } from '@/components/providers/DataProvider';

const StressTestControls = React.memo(function StressTestControls() {
  const { dataPointTarget, setDataPointTarget, resetData, isStreaming, setStreamingEnabled } = useData();

  function handleTargetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setDataPointTarget(Number(e.target.value));
  }

  return (
    <div className="filter-panel" style={{ marginTop: '12px' }}>
      <div className="control-group">
        <span className="control-label">Data Load</span>
        <select className="control-select" value={dataPointTarget} onChange={handleTargetChange}>
          <option value={1000}>1K points</option>
          <option value={10000}>10K points (Target)</option>
          <option value={20000}>20K points (Stress)</option>
          <option value={50000}>50K points (Max Stress)</option>
        </select>
        <button className="control-button" onClick={resetData}>
          Reload
        </button>
      </div>

      <div className="control-group" style={{ marginLeft: '12px' }}>
        <span className="control-label">Stream</span>
        <button 
          className={`control-button ${isStreaming ? 'active' : ''}`}
          onClick={() => setStreamingEnabled(!isStreaming)}
        >
          {isStreaming ? 'Pause' : 'Resume'}
        </button>
      </div>
      
      {dataPointTarget >= 20000 && (
        <span className="stress-indicator" style={{ marginLeft: '12px' }}>
          STRESS MODE ACTIVE
        </span>
      )}
    </div>
  );
});

export default StressTestControls;
