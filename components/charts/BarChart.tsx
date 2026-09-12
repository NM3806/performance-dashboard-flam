'use client';

import React, { useCallback } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useChartRenderer } from '@/hooks/useChartRenderer';
import { ChartDimensions, ViewTransform, DataPoint } from '@/lib/types';
import { aggregateData } from '@/lib/dataGenerator';
import {
  clearCanvas,
  drawXAxis,
  drawYAxis,
  getCategoryColor,
  computeBounds,
  mapX,
  mapY,
} from '@/lib/canvasUtils';

// Bar chart — shows aggregated values per time bucket
const BarChart = React.memo(function BarChart() {
  const { dataRef, dataVersion, filterState, categories } = useData();

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, dim: ChartDimensions, transform: ViewTransform) => {
      clearCanvas(ctx, dim.width, dim.height);

      const data = dataRef.current;
      if (data.length === 0) return;

      // Filter by categories and time range
      const { categories: selectedCats, timeRange, aggregation } = filterState;
      const catSet = new Set(selectedCats);
      const filtered: DataPoint[] = [];
      for (let i = 0; i < data.length; i++) {
        const p = data[i];
        if (!catSet.has(p.category)) continue;
        if (timeRange && (p.timestamp < timeRange.start || p.timestamp > timeRange.end)) continue;
        filtered.push(p);
      }
      if (filtered.length === 0) return;

      // Aggregate
      const aggregated = aggregateData(filtered, aggregation);
      if (aggregated.length === 0) return;

      // Use only first selected category for bar chart simplicity
      const primaryCat = selectedCats[0];
      const catBars = aggregated.filter((a) => a.category === primaryCat);
      if (catBars.length === 0) return;

      const timestamps = catBars.map((a) => a.timestamp);
      const values = catBars.map((a) => a.avg);
      const tBounds = computeBounds(timestamps);
      const vBounds = { min: 0, max: computeBounds(values).max };

      drawXAxis(ctx, dim, tBounds.min, tBounds.max, transform);
      drawYAxis(ctx, dim, vBounds.min, vBounds.max, transform);

      const plotLeft = dim.padding.left;
      const plotRight = dim.width - dim.padding.right;
      const plotBottom = dim.height - dim.padding.bottom;

      // Bar width based on number of bars and available space
      const plotWidth = plotRight - plotLeft;
      const barWidth = Math.max(2, Math.min(20, (plotWidth / catBars.length) * 0.7));

      ctx.fillStyle = getCategoryColor(primaryCat, categories);
      ctx.globalAlpha = 0.85;

      for (let i = 0; i < catBars.length; i++) {
        const x = mapX(catBars[i].timestamp, tBounds.min, tBounds.max, dim, transform);
        const y = mapY(catBars[i].avg, vBounds.min, vBounds.max, dim, transform);
        const barHeight = plotBottom - y;

        if (x < plotLeft - barWidth || x > plotRight + barWidth) continue;

        ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
      }

      ctx.globalAlpha = 1;
    },
    [dataRef, filterState, categories]
  );

  const { canvasRef, containerRef } = useChartRenderer({
    render,
    deps: [dataVersion, filterState],
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '200px' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
});

export default BarChart;
