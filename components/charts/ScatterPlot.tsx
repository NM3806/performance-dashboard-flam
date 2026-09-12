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
} from '@/lib/canvasUtils';

// Scatter plot with zoom/pan support
const ScatterPlot = React.memo(function ScatterPlot() {
  const { dataRef, dataVersion, filterState, categories } = useData();
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

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

      ctx.globalAlpha = 0.5;
      const dotRadius = filtered.length > 5000 ? 1.5 : 2.5;

      for (const cat of selectedCats) {
        ctx.fillStyle = getCategoryColor(cat, categories);
        ctx.beginPath();
        for (let i = 0; i < filtered.length; i++) {
          if (filtered[i].category !== cat) continue;

          const px = mapX(filtered[i].timestamp, tBounds.min, tBounds.max, dim, transform);
          const py = mapY(filtered[i].value, vBounds.min, vBounds.max, dim, transform);

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

  function handleReset() {
    transform.current = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };
    requestRender();
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 8px 0' }}>
        <button className="control-button" onClick={handleReset} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
          Reset
        </button>
      </div>
      <div
        ref={containerRef}
        style={{ position: 'relative', width: '100%', minHeight: '200px', cursor: 'grab' }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
    </div>
  );
});

export default ScatterPlot;
