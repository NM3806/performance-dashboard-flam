import { useEffect, useRef, useCallback } from 'react';
import { ChartDimensions, ViewTransform } from '@/lib/types';
import { setupCanvas, DEFAULT_PADDING, IDENTITY_TRANSFORM } from '@/lib/canvasUtils';
import { globalPerfMetrics } from '@/hooks/usePerformanceMonitor';

interface UseChartRendererOptions {
  render: (ctx: CanvasRenderingContext2D, dim: ChartDimensions, transform: ViewTransform) => void;
  deps: unknown[];
}

interface UseChartRendererResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  transform: React.MutableRefObject<ViewTransform>;
  requestRender: () => void;
}

export function useChartRenderer(options: UseChartRendererOptions): UseChartRendererResult {
  const { render, deps } = options;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const transform = useRef<ViewTransform>({ ...IDENTITY_TRANSFORM });
  const rafRef = useRef<number | null>(null);
  const dimRef = useRef<ChartDimensions>({
    width: 0,
    height: 0,
    padding: { ...DEFAULT_PADDING },
  });

  const requestRender = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dim = dimRef.current;
      if (dim.width === 0 || dim.height === 0) return;

      const ctx = setupCanvas(canvas, dim.width, dim.height);
      if (!ctx) return;

      const t0 = performance.now();
      render(ctx, dim, transform.current);
      globalPerfMetrics.renderTime = performance.now() - t0;
    });
  }, [render]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        dimRef.current.width = width;
        dimRef.current.height = height;
        requestRender();
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [requestRender]);

  useEffect(() => {
    requestRender();
  }, [requestRender, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return { canvasRef, containerRef, transform, requestRender };
}
