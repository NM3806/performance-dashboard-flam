'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useVirtualization } from '@/hooks/useVirtualization';
import { DataPoint } from '@/lib/types';
import { getCategoryColor } from '@/lib/canvasUtils';

const ROW_HEIGHT = 32;
const TABLE_HEIGHT = 320;

// Virtualized data table — only renders visible rows + buffer
const DataTable = React.memo(function DataTable() {
  const { dataRef, dataVersion, filterState, categories } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter data to match current filters
  const filteredData = useMemo(() => {
    if (!mounted) return [];
    
    const data = dataRef.current;
    const { categories: activeCats, timeRange } = filterState;
    const catSet = new Set(activeCats);
    const result: DataPoint[] = [];
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      if (!catSet.has(p.category)) continue;
      if (timeRange && (p.timestamp < timeRange.start || p.timestamp > timeRange.end)) continue;
      result.push(p);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion, filterState, mounted]);

  const { visibleRange, totalHeight, offsetY, onScroll, scrollContainerRef } = useVirtualization({
    itemCount: filteredData.length,
    itemHeight: ROW_HEIGHT,
    containerHeight: TABLE_HEIGHT,
  });

  const visibleRows = filteredData.slice(visibleRange.start, visibleRange.end);
  const totalCount = dataRef.current ? dataRef.current.length : 0;

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        <span>Timestamp</span>
        <span>Value</span>
        <span>Series</span>
      </div>
      <div
        ref={scrollContainerRef}
        className="data-table-viewport"
        style={{ height: `${TABLE_HEIGHT}px` }}
        onScroll={onScroll}
      >
        {filteredData.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-tertiary)',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              No data for selected filters
            </span>
            <span style={{ fontSize: '0.78rem' }}>Adjust time range or series filters</span>
          </div>
        ) : (
          /* Spacer to maintain scroll height */
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: `${offsetY}px`, left: 0, right: 0 }}>
              {visibleRows.map((point, i) => (
                <div key={visibleRange.start + i} className="data-table-row" style={{ height: `${ROW_HEIGHT}px` }}>
                  <span className="mono">{formatTimestamp(point.timestamp)}</span>
                  <span className="mono">{point.value.toFixed(2)}</span>
                  <span className="table-series-cell">
                    <span
                      className="table-series-dot"
                      style={{ backgroundColor: getCategoryColor(point.category, categories) }}
                    />
                    <span>{point.category}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="data-table-footer">
        <span>Showing {filteredData.length.toLocaleString()} of {mounted ? totalCount.toLocaleString() : '—'} points</span>
        <span className="meta-sep">·</span>
        <span>{filterState.categories.length} of {categories.length} series visible</span>
      </div>
    </div>
  );
});

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  const ms = d.getMilliseconds().toString().padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

export default DataTable;
