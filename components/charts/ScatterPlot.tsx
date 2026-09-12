'use client';

import React, { useCallback } from 'react';
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

// Scatter plot — renders each data point as a small dot
const ScatterPlot = React.memo(function ScatterPlot() {
  const { dataRef, dataVersion, filterState, categories } = useData();

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, dim: ChartDimensions, transform: ViewTransform) => {
      clearCanvas(ctx, dim.width, dim.height);

      const data = dataRef.current;
      if (data.length === 0) return;

      const { categories: selectedCats, timeRange } = filterState;
      const catSet = new Set(selectedCats);
      const filtered: DataPoint[] = [];
      for (let i = 0; i < data.length; i++) {
        const p = data[i];
        if (!catSet.has(p.category)) continue;
        if (timeRange && (p.timestamp < timeRange.start || p.timestamp > timeRange.end)) continue;
        filtered.push(p);
      }
      if (filtered.length === 0) return;

      const timestamps = filtered.map((p) => p.timestamp);
      const values = filtered.map((p) => p.value);
      const tBounds = computeBounds(timestamps);
      const vBounds = computeBounds(values);

      drawXAxis(ctx, dim, tBounds.min, tBounds.max, transform);
      drawYAxis(ctx, dim, vBounds.min, vBounds.max, transform);

      const plotLeft = dim.padding.left;
      const plotRight = dim.width - dim.padding.right;
      const plotTop = dim.padding.top;
      const plotBottom = dim.height - dim.padding.bottom;

      // Draw points, grouped by category for fewer style changes
      ctx.globalAlpha = 0.5;
      const dotRadius = filtered.length > 5000 ? 1.5 : 2.5;

      for (const cat of selectedCats) {
        ctx.fillStyle = getCategoryColor(cat, categories);

        // Batch draw using beginPath + arc for each
        ctx.beginPath();
        for (let i = 0; i < filtered.length; i++) {
          if (filtered[i].category !== cat) continue;

          const px = mapX(filtered[i].timestamp, tBounds.min, tBounds.max, dim, transform);
          const py = mapY(filtered[i].value, vBounds.min, vBounds.max, dim, transform);

          // Cull points outside visible area
          if (px < plotLeft || px > plotRight || py < plotTop || py > plotBottom) continue;

          ctx.moveTo(px + dotRadius, py);
          ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
        }
        ctx.fill();
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

export default ScatterPlot;
