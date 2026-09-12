'use client';

import React, { useCallback, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useChartRenderer } from '@/hooks/useChartRenderer';
import { ChartDimensions, ViewTransform, DataPoint } from '@/lib/types';
import {
  clearCanvas,
  mapX,
  mapY,
  drawXAxis,
  drawYAxis,
  getCategoryColor,
  computeBounds,
} from '@/lib/canvasUtils';

// Line chart — renders time-series lines per category on canvas
const LineChart = React.memo(function LineChart() {
  const { dataRef, dataVersion, filterState, categories } = useData();

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, dim: ChartDimensions, transform: ViewTransform) => {
      clearCanvas(ctx, dim.width, dim.height);

      const data = dataRef.current;
      if (data.length === 0) return;

      // Filter by selected categories and time range
      const { categories: selectedCats, timeRange } = filterState;
      const filtered = filterData(data, selectedCats, timeRange);
      if (filtered.length === 0) return;

      // Compute bounds
      const timestamps = filtered.map((p) => p.timestamp);
      const values = filtered.map((p) => p.value);
      const tBounds = computeBounds(timestamps);
      const vBounds = computeBounds(values);

      // Draw axes
      drawXAxis(ctx, dim, tBounds.min, tBounds.max, transform);
      drawYAxis(ctx, dim, vBounds.min, vBounds.max, transform);

      // Group by category and draw lines
      const plotLeft = dim.padding.left;
      const plotRight = dim.width - dim.padding.right;
      const plotTop = dim.padding.top;
      const plotBottom = dim.height - dim.padding.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotRight - plotLeft, plotBottom - plotTop);
      ctx.clip();

      for (const cat of selectedCats) {
        const catPoints = filtered.filter((p) => p.category === cat);
        if (catPoints.length < 2) continue;

        // Sort by timestamp
        catPoints.sort((a, b) => a.timestamp - b.timestamp);

        ctx.strokeStyle = getCategoryColor(cat, categories);
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        let started = false;
        // Downsample: skip points that map to the same pixel
        let lastPx = -1;
        for (let i = 0; i < catPoints.length; i++) {
          const px = Math.round(mapX(catPoints[i].timestamp, tBounds.min, tBounds.max, dim, transform));
          if (px === lastPx && i < catPoints.length - 1) continue;
          lastPx = px;

          const py = mapY(catPoints[i].value, vBounds.min, vBounds.max, dim, transform);
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      ctx.restore();
    },
    [dataRef, filterState, categories]
  );

  const { canvasRef, containerRef } = useChartRenderer({
    render,
    deps: [dataVersion, filterState],
  });

  return (
    <div className="chart-area primary-chart">
      <div className="chart-title">Line Chart</div>
      <div ref={containerRef} style={{ position: 'relative', flex: 1, minHeight: '280px' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
    </div>
  );
});

// Helper: filter data by categories and time range
function filterData(
  data: DataPoint[],
  categories: string[],
  timeRange: { start: number; end: number } | null
): DataPoint[] {
  const catSet = new Set(categories);
  const result: DataPoint[] = [];
  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    if (!catSet.has(p.category)) continue;
    if (timeRange && (p.timestamp < timeRange.start || p.timestamp > timeRange.end)) continue;
    result.push(p);
  }
  return result;
}

export default LineChart;
