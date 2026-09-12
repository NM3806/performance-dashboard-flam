'use client';

import React, { useCallback } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { AggregationPeriod } from '@/lib/types';
import { getCategoryColor } from '@/lib/canvasUtils';

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
    categories,
    filterState,
    setSelectedCategories,
    clearFilters,
    setTimeRange,
    setAggregation,
    resetView,
    isStreaming,
    setStreamingEnabled,
    stressMode,
    setStressMode,
    dataPointTarget,
    setDataPointTarget,
  } = useData();

  const selected = filterState.categories;

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

  function toggleCategory(cat: string) {
    const isSelected = selected.includes(cat);
    if (isSelected) {
      if (selected.length <= 1) return; // keep at least 1
      setSelectedCategories(selected.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selected, cat]);
    }
  }

  return (
    <div className="dashboard-controls">
      {/* VIEW CONTROLS */}
      <div className="control-row">
        <span className="control-row-label">View</span>
        <div className="control-group">
          <span className="control-sublabel">Range</span>
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
          <span className="control-sublabel">Aggregation</span>
          {AGGREGATIONS.map((agg) => (
            <button
              key={agg.value}
              className={`control-button ${filterState.aggregation === agg.value ? 'active' : ''}`}
              onClick={() => setAggregation(agg.value)}
            >
              {agg.label}
            </button>
          ))}
        </div>

        <div className="control-group">
          <button className="control-button" onClick={resetView}>
            Reset view
          </button>
          <span className="control-hint">Scroll to zoom · Drag to pan</span>
        </div>
      </div>

      {/* DATA CONTROLS */}
      <div className="control-row">
        <span className="control-row-label">Data</span>
        <div className="control-group filter-panel">
          {categories.map((cat) => {
            const isSelected = selected.includes(cat);
            const color = getCategoryColor(cat, categories);
            return (
              <button
                key={cat}
                className={`filter-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                <span className="chip-dot" style={{ backgroundColor: color }} />
                <span>{cat}</span>
              </button>
            );
          })}

          <button
            className={`control-button ${selected.length === categories.length ? 'active' : ''}`}
            onClick={clearFilters}
          >
            All
          </button>

          <span className="control-count">
            {selected.length} of {categories.length} selected
          </span>
        </div>
      </div>

      {/* LOAD CONTROLS */}
      <div className="control-row">
        <span className="control-row-label">Load</span>
        <div className="control-group">
          <span className="control-sublabel">Points</span>
          {LOAD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`control-button ${dataPointTarget === opt.value ? 'active' : ''}`}
              onClick={() => setDataPointTarget(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="control-group">
          <span className="control-sublabel">Stream</span>
          <button
            className={`control-button ${isStreaming ? 'active' : ''}`}
            onClick={() => setStreamingEnabled(!isStreaming)}
          >
            {isStreaming ? 'Pause' : 'Resume'}
          </button>
        </div>

        <div className="control-group">
          <span className="control-sublabel">Stress</span>
          <button
            className={`control-button ${stressMode ? 'active' : ''}`}
            onClick={() => setStressMode(!stressMode)}
          >
            {stressMode ? 'Stress Mode: On (60Hz)' : 'Stress Mode: Off'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default DashboardControls;
