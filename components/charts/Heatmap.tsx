'use client';

import React, { useCallback } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useChartRenderer } from '@/hooks/useChartRenderer';
import { ChartDimensions } from '@/lib/types';
import { filterData } from '@/lib/dataGenerator';
import { clearCanvas, drawEmptyState } from '@/lib/canvasUtils';

const Heatmap = React.memo(function Heatmap() {
  const { dataRef, dataVersion, filterState } = useData();

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, dim: ChartDimensions) => {
      clearCanvas(ctx, dim.width, dim.height);

      const data = dataRef.current;
      if (data.length === 0) {
        drawEmptyState(ctx, dim, 'Loading data...');
        return;
      }

      const { categories: selectedCats, timeRange } = filterState;
      const filtered = filterData(data, selectedCats, timeRange);
      if (filtered.length === 0) {
        drawEmptyState(ctx, dim, 'No data for selected filters');
        return;
      }

      let tMin = filtered[0].timestamp, tMax = filtered[0].timestamp;
      let vMin = filtered[0].value, vMax = filtered[0].value;
      for (let i = 1; i < filtered.length; i++) {
        if (filtered[i].timestamp < tMin) tMin = filtered[i].timestamp;
        if (filtered[i].timestamp > tMax) tMax = filtered[i].timestamp;
        if (filtered[i].value < vMin) vMin = filtered[i].value;
        if (filtered[i].value > vMax) vMax = filtered[i].value;
      }

      const plotLeft = dim.padding.left;
      const plotRight = dim.width - dim.padding.right;
      const plotTop = dim.padding.top;
      const plotBottom = dim.height - dim.padding.bottom;
      const plotWidth = plotRight - plotLeft;
      const plotHeight = plotBottom - plotTop;

      const cols = Math.min(60, Math.max(10, Math.floor(plotWidth / 12)));
      const rows = Math.min(20, Math.max(5, Math.floor(plotHeight / 12)));
      const cellW = plotWidth / cols;
      const cellH = plotHeight / rows;

      const tRange = tMax - tMin || 1;
      const vRange = vMax - vMin || 1;
      const grid = new Uint32Array(cols * rows);
      let maxCount = 0;

      for (let i = 0; i < filtered.length; i++) {
        const col = Math.min(cols - 1, Math.floor(((filtered[i].timestamp - tMin) / tRange) * cols));
        const row = Math.min(rows - 1, Math.floor(((vMax - filtered[i].value) / vRange) * rows));
        const idx = row * cols + col;
        grid[idx]++;
        if (grid[idx] > maxCount) maxCount = grid[idx];
      }

      if (maxCount === 0) return;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const count = grid[r * cols + c];
          if (count === 0) continue;

          const intensity = count / maxCount;
          const alpha = 0.12 + intensity * 0.84;
          ctx.fillStyle = `rgba(30, 64, 175, ${alpha})`;
          ctx.fillRect(
            plotLeft + c * cellW,
            plotTop + r * cellH,
            cellW - 0.5,
            cellH - 0.5
          );
        }
      }

      ctx.fillStyle = '#8a8a8a';
      ctx.font = '11px "IBM Plex Mono", monospace';

      ctx.textAlign = 'center';
      const xTicks = Math.min(6, cols);
      for (let i = 0; i <= xTicks; i++) {
        const t = i / xTicks;
        const timeVal = tMin + t * tRange;
        const x = plotLeft + t * plotWidth;
        const date = new Date(timeVal);
        ctx.fillText(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          x,
          plotBottom + 16
        );
      }

      ctx.textAlign = 'right';
      const yTicks = Math.min(5, rows);
      for (let i = 0; i <= yTicks; i++) {
        const t = i / yTicks;
        const val = vMax - t * vRange;
        const y = plotTop + t * plotHeight;
        ctx.fillText(val.toFixed(0), plotLeft - 8, y + 4);
      }

      ctx.strokeStyle = '#d4d0cb';
      ctx.lineWidth = 1;
      ctx.strokeRect(plotLeft, plotTop, plotWidth, plotHeight);
    },
    [dataRef, filterState]
  );

  const { canvasRef, containerRef } = useChartRenderer({
    render,
    deps: [dataVersion, filterState],
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '160px' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
});

export default Heatmap;
