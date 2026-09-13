'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useChartRenderer } from '@/hooks/useChartRenderer';
import { ChartDimensions, ViewTransform } from '@/lib/types';
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
import { filterData } from '@/lib/dataGenerator';
import { useMounted } from '@/hooks/useMounted';

const LineChart = React.memo(function LineChart() {
  const { dataRef, dataVersion, totalPoints, filterState, categories, setSelectedCategories, resetViewVersion } = useData();
  const mounted = useMounted();
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  function toggleCategory(cat: string) {
    const selected = filterState.categories;
    const isSelected = selected.includes(cat);
    if (isSelected) {
      if (selected.length <= 1) return;
      setSelectedCategories(selected.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selected, cat]);
    }
  }

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

  useEffect(() => {
    if (resetViewVersion > 0) {
      transform.current = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };
      requestRender();
    }
  }, [resetViewVersion, transform, requestRender]);

  function handleReset() {
    transform.current = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };
    requestRender();
  }

  const visibleSeriesCount = filterState.categories.length;

  return (
    <div className="chart-area primary-chart">
      <div className="primary-chart-header">
        <div className="primary-chart-meta">
          <div className="primary-chart-title">Value over time</div>
          <div className="primary-chart-sub">
            <span suppressHydrationWarning>
              {visibleSeriesCount} series · {mounted ? totalPoints.toLocaleString() : '—'} points
            </span>
            <span className="meta-sep">/</span>
            <span className="interaction-hint">Scroll to zoom · Drag to pan</span>
          </div>
        </div>

        <div className="primary-chart-actions">
          <div className="legend-strip" role="toolbar" aria-label="Toggle series visibility">
            {categories.map((cat) => {
              const isVisible = filterState.categories.includes(cat);
              const color = getCategoryColor(cat, categories);
              return (
                <button
                  key={cat}
                  type="button"
                  className={`legend-chip ${isVisible ? 'active' : 'inactive'}`}
                  onClick={() => toggleCategory(cat)}
                  title={`Toggle ${cat}`}
                >
                  <span
                    className="legend-indicator"
                    style={{
                      backgroundColor: isVisible ? color : 'transparent',
                      borderColor: color,
                    }}
                  />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="control-button reset-view-btn"
            onClick={handleReset}
          >
            Reset view
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="primary-canvas-wrap"
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
    </div>
  );
});

export default LineChart;
