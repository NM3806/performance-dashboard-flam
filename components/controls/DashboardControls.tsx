'use client';

import React, { useCallback } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { AggregationPeriod } from '@/lib/types';

const TIME_RANGES = [
  { label: '1h', ms: 60 * 60 * 1000 },
  { label: '6h', ms: 6 * 60 * 60 * 1000 },
  { label: '24h', ms: 24 * 60 * 60 * 1000 },
  { label: 'All', ms: 0 },
];

const AGGREGATIONS: { label: string; value: AggregationPeriod }[] = [
  { label: '1min', value: '1min' },
  { label: '5min', value: '5min' },
  { label: '1hour', value: '1hour' },
];

const LOAD_OPTIONS = [
  { label: '10K (Target)', value: 10000 },
  { label: '25K', value: 25000 },
  { label: '50K', value: 50000 },
];

export const DashboardControls = React.memo(function DashboardControls() {
  const {
    filterState,
    setTimeRange,
    setAggregation,
    isStreaming,
    setStreamingEnabled,
    stressMode,
    setStressMode,
    dataPointTarget,
    setDataPointTarget,
    resetData,
  } = useData();

  const handleTimeRange = useCallback(
    (ms: number) => {
      if (ms === 0) {
        setTimeRange(null);
      } else {
        const now = Date.now();
        setTimeRange({ start: now - ms, end: now });
      }
    },
    [setTimeRange]
  );

  function isTimeRangeActive(ms: number): boolean {
    if (ms === 0) return filterState.timeRange === null;
    if (!filterState.timeRange) return false;
    const duration = filterState.timeRange.end - filterState.timeRange.start;
    return Math.abs(duration - ms) < 1000;
  }

  return (
    <div className="dashboard-controls">
      {/* VIEW CONTROLS */}
      <div className="control-row">
        <span className="control-row-label">View</span>
        <div className="control-group">
          <span className="control-sublabel">Range</span>
          <div className="button-group">
            {TIME_RANGES.map((tr) => (
              <button
                key={tr.label}
                type="button"
                className={`control-button ${isTimeRangeActive(tr.ms) ? 'active' : ''}`}
                onClick={() => handleTimeRange(tr.ms)}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <span className="control-sublabel">Aggregation</span>
          <div className="button-group">
            {AGGREGATIONS.map((agg) => (
              <button
                key={agg.value}
                type="button"
                className={`control-button ${filterState.aggregation === agg.value ? 'active' : ''}`}
                onClick={() => setAggregation(agg.value)}
              >
                {agg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DATA LOAD CONTROLS */}
      <div className="control-row">
        <span className="control-row-label">Data</span>
        <div className="control-group">
          <span className="control-sublabel">Points</span>
          <div className="button-group">
            {LOAD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`control-button ${dataPointTarget === opt.value ? 'active' : ''}`}
                onClick={() => setDataPointTarget(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <span className="control-sublabel">Stream</span>
          <button
            type="button"
            className={`control-button ${isStreaming ? 'active' : ''}`}
            onClick={() => setStreamingEnabled(!isStreaming)}
          >
            {isStreaming ? 'Pause' : 'Resume'}
          </button>
        </div>

        <div className="control-group">
          <span className="control-sublabel">Stress test</span>
          <button
            type="button"
            className={`control-button ${stressMode ? 'active' : ''}`}
            onClick={() => setStressMode(!stressMode)}
          >
            {stressMode ? 'On' : 'Off'}
          </button>
        </div>

        <div className="control-group">
          <button
            type="button"
            className="control-button reload-btn"
            onClick={resetData}
            title="Generate fresh sample data"
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
});

export default DashboardControls;
