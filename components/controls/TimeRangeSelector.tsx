'use client';

import React, { useCallback } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { AggregationPeriod, TimeRange } from '@/lib/types';

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

// Time range selector + aggregation period controls
const TimeRangeSelector = React.memo(function TimeRangeSelector() {
  const { filterState, setTimeRange, setAggregation } = useData();

  const handleTimeRange = useCallback(
    (ms: number) => {
      if (ms === 0) {
        setTimeRange(null); // show all
      } else {
        const now = Date.now();
        setTimeRange({ start: now - ms, end: now });
      }
    },
    [setTimeRange]
  );

  const handleAggregation = useCallback(
    (period: AggregationPeriod) => {
      setAggregation(period);
    },
    [setAggregation]
  );

  // Determine which time range button is active
  function isTimeRangeActive(ms: number): boolean {
    if (ms === 0) return filterState.timeRange === null;
    if (!filterState.timeRange) return false;
    const duration = filterState.timeRange.end - filterState.timeRange.start;
    return Math.abs(duration - ms) < 1000; // within 1s tolerance
  }

  return (
    <div className="controls-bar">
      <div className="control-group">
        <span className="control-label">Time range</span>
        {TIME_RANGES.map((tr) => (
          <button
            key={tr.label}
            className={`control-button ${isTimeRangeActive(tr.ms) ? 'active' : ''}`}
            onClick={() => handleTimeRange(tr.ms)}
          >
            {tr.label}
          </button>
        ))}
      </div>
      <div className="control-group">
        <span className="control-label">Aggregation</span>
        {AGGREGATIONS.map((agg) => (
          <button
            key={agg.value}
            className={`control-button ${filterState.aggregation === agg.value ? 'active' : ''}`}
            onClick={() => handleAggregation(agg.value)}
          >
            {agg.label}
          </button>
        ))}
      </div>
    </div>
  );
});

export default TimeRangeSelector;
