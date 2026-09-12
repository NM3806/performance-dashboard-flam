'use client';

import React, { useCallback, useRef, useEffect } from 'react';
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
  drawEmptyState,
} from '@/lib/canvasUtils';

// Line chart with zoom/pan support
const LineChart = React.memo(function LineChart() {
  const { dataRef, dataVersion, filterState, categories, resetViewVersion } = useData();
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, dim: ChartDimensions, transform: ViewTransform) => {
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

      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotRight - plotLeft, plotBottom - plotTop);
      ctx.clip();

      for (const cat of selectedCats) {
        const catPoints = filtered.filter((p) => p.category === cat);
        if (catPoints.length < 2) continue;

        catPoints.sort((a, b) => a.timestamp - b.timestamp);

        ctx.strokeStyle = getCategoryColor(cat, categories);
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        let started = false;
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

  const { canvasRef, containerRef, transform, requestRender } = useChartRenderer({
    render,
    deps: [dataVersion, filterState],
  });

  // Zoom via wheel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const t = transform.current;
      t.scaleX = Math.max(0.5, Math.min(20, t.scaleX * delta));
      t.scaleY = Math.max(0.5, Math.min(20, t.scaleY * delta));
      requestRender();
    }

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [containerRef, transform, requestRender]);

  // Pan via pointer drag
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handlePointerDown(e: PointerEvent) {
      isDragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      container!.setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: PointerEvent) {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      const t = transform.current;
      t.offsetX += dx / t.scaleX;
      t.offsetY += dy / t.scaleY;
      requestRender();
    }

    function handlePointerUp() {
      isDragging.current = false;
    }

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [containerRef, transform, requestRender]);

  // Reset zoom/pan when global resetView fires
  useEffect(() => {
    if (resetViewVersion > 0) {
      transform.current = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };
      requestRender();
    }
  }, [resetViewVersion, transform, requestRender]);

  // Reset zoom/pan button
  function handleReset() {
    transform.current = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };
    requestRender();
  }

  return (
    <div className="chart-area primary-chart">
      <div className="chart-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Value over time</span>
        <button className="control-button" onClick={handleReset} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
          Reset view
        </button>
      </div>
      <div
        ref={containerRef}
        style={{ position: 'relative', flex: 1, minHeight: '280px', cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
    </div>
  );
});

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
