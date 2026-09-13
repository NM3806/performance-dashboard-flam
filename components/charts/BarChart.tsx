'use client';

import React, { useCallback } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useChartRenderer } from '@/hooks/useChartRenderer';
import { ChartDimensions, ViewTransform } from '@/lib/types';
import { aggregateData, filterData } from '@/lib/dataGenerator';
import {
  clearCanvas,
  drawXAxis,
  drawYAxis,
  computeBounds,
  mapX,
  mapY,
  getCategoryColor,
  drawEmptyState,
} from '@/lib/canvasUtils';

const BarChart = React.memo(function BarChart() {
  const { dataRef, dataVersion, filterState, categories } = useData();

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, dim: ChartDimensions, transform: ViewTransform) => {
      clearCanvas(ctx, dim.width, dim.height);

      const data = dataRef.current;
      if (data.length === 0) {
        drawEmptyState(ctx, dim, 'Loading data...');
        return;
      }

      const { categories: selectedCats, timeRange, aggregation } = filterState;
      const filtered = filterData(data, selectedCats, timeRange);
      if (filtered.length === 0) {
        drawEmptyState(ctx, dim, 'No data for selected filters');
        return;
      }

      const aggregated = aggregateData(filtered, aggregation);
      if (aggregated.length === 0) {
        drawEmptyState(ctx, dim, 'No data for selected filters');
        return;
      }

      const bucketMap = new Map<number, { sum: number; count: number }>();
      for (const item of aggregated) {
        const cur = bucketMap.get(item.timestamp) || { sum: 0, count: 0 };
        cur.sum += item.avg * item.count;
        cur.count += item.count;
        bucketMap.set(item.timestamp, cur);
      }

      const catBars = Array.from(bucketMap.entries())
        .map(([timestamp, { sum, count }]) => ({ timestamp, avg: sum / count }))
        .sort((a, b) => a.timestamp - b.timestamp);

      if (catBars.length === 0) {
        drawEmptyState(ctx, dim, 'No data for selected filters');
        return;
      }

      const timestamps = catBars.map((a) => a.timestamp);
      const values = catBars.map((a) => a.avg);
      const tBounds = computeBounds(timestamps);
      const vBounds = { min: 0, max: computeBounds(values).max };

      drawXAxis(ctx, dim, tBounds.min, tBounds.max, transform);
      drawYAxis(ctx, dim, vBounds.min, vBounds.max, transform);

      const plotLeft = dim.padding.left;
      const plotRight = dim.width - dim.padding.right;
      const plotBottom = dim.height - dim.padding.bottom;

      const plotWidth = plotRight - plotLeft;
      const barWidth = Math.max(2, Math.min(24, (plotWidth / catBars.length) * 0.75));

      ctx.fillStyle = selectedCats.length === 1 ? getCategoryColor(selectedCats[0], categories) : '#1e40af';
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
