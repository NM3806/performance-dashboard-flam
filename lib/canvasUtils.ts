import { ChartDimensions, ViewTransform } from './types';

// Default chart padding
export const DEFAULT_PADDING = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 55,
};

// Setup canvas with devicePixelRatio for crisp rendering
export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  return ctx;
}

// Clear the canvas
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);
}

// Map a data value to pixel X coordinate
export function mapX(
  value: number,
  dataMin: number,
  dataMax: number,
  dim: ChartDimensions,
  transform: ViewTransform
): number {
  const range = dataMax - dataMin || 1;
  const plotWidth = dim.width - dim.padding.left - dim.padding.right;
  const normalized = (value - dataMin) / range;
  return dim.padding.left + (normalized * plotWidth + transform.offsetX) * transform.scaleX;
}

// Map a data value to pixel Y coordinate (inverted — 0 at top)
export function mapY(
  value: number,
  dataMin: number,
  dataMax: number,
  dim: ChartDimensions,
  transform: ViewTransform
): number {
  const range = dataMax - dataMin || 1;
  const plotHeight = dim.height - dim.padding.top - dim.padding.bottom;
  const normalized = (value - dataMin) / range;
  return dim.padding.top + ((1 - normalized) * plotHeight + transform.offsetY) * transform.scaleY;
}

// Draw X axis with time labels
export function drawXAxis(
  ctx: CanvasRenderingContext2D,
  dim: ChartDimensions,
  minTime: number,
  maxTime: number,
  transform: ViewTransform
) {
  const plotLeft = dim.padding.left;
  const plotRight = dim.width - dim.padding.right;
  const y = dim.height - dim.padding.bottom;

  ctx.strokeStyle = '#d4d0cb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(plotLeft, y);
  ctx.lineTo(plotRight, y);
  ctx.stroke();

  // Tick marks and labels
  const tickCount = Math.min(8, Math.max(3, Math.floor((plotRight - plotLeft) / 100)));
  ctx.fillStyle = '#8a8a8a';
  ctx.font = '11px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';

  for (let i = 0; i <= tickCount; i++) {
    const t = i / tickCount;
    const timeVal = minTime + t * (maxTime - minTime);
    const x = mapX(timeVal, minTime, maxTime, dim, transform);

    if (x < plotLeft || x > plotRight) continue;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 5);
    ctx.stroke();

    const date = new Date(timeVal);
    const label = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    ctx.fillText(label, x, y + 18);
  }
}

// Draw Y axis with value labels
export function drawYAxis(
  ctx: CanvasRenderingContext2D,
  dim: ChartDimensions,
  minVal: number,
  maxVal: number,
  transform: ViewTransform
) {
  const x = dim.padding.left;
  const plotTop = dim.padding.top;
  const plotBottom = dim.height - dim.padding.bottom;

  ctx.strokeStyle = '#d4d0cb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, plotTop);
  ctx.lineTo(x, plotBottom);
  ctx.stroke();

  const tickCount = 5;
  ctx.fillStyle = '#8a8a8a';
  ctx.font = '11px "IBM Plex Mono", monospace';
  ctx.textAlign = 'right';

  for (let i = 0; i <= tickCount; i++) {
    const t = i / tickCount;
    const val = maxVal - t * (maxVal - minVal);
    const yPos = mapY(val, minVal, maxVal, dim, transform);

    if (yPos < plotTop || yPos > plotBottom) continue;

    // Grid line
    ctx.strokeStyle = '#e5e2dd';
    ctx.beginPath();
    ctx.moveTo(x, yPos);
    ctx.lineTo(dim.width - dim.padding.right, yPos);
    ctx.stroke();

    // Tick
    ctx.strokeStyle = '#d4d0cb';
    ctx.beginPath();
    ctx.moveTo(x - 5, yPos);
    ctx.lineTo(x, yPos);
    ctx.stroke();

    ctx.fillText(val.toFixed(0), x - 8, yPos + 4);
  }
}

// Deliberate 5-color palette for data visualization on light background (no status red/green)
const CHART_COLORS = ['#1e40af', '#0e7490', '#7e22ce', '#c2410c', '#4d7c0f'];

export function getCategoryColor(category: string, categories: string[]): string {
  const idx = categories.indexOf(category);
  return CHART_COLORS[idx % CHART_COLORS.length];
}

// Compute data bounds from an array of numbers
export function computeBounds(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 100 };
  let min = values[0];
  let max = values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }
  // Add 5% padding
  const range = max - min || 1;
  return { min: min - range * 0.05, max: max + range * 0.05 };
}

// Identity transform (no zoom/pan)
export const IDENTITY_TRANSFORM: ViewTransform = {
  offsetX: 0,
  offsetY: 0,
  scaleX: 1,
  scaleY: 1,
};

// Render an informative empty state directly on canvas
export function drawEmptyState(
  ctx: CanvasRenderingContext2D,
  dim: ChartDimensions,
  message: string = 'No data for selected filters'
) {
  clearCanvas(ctx, dim.width, dim.height);
  const centerX = dim.width / 2;
  const centerY = dim.height / 2;

  ctx.fillStyle = '#8a8a8a';
  ctx.font = '13px "Inter", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, centerX, centerY - 8);

  ctx.font = '11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#a8a29e';
  ctx.fillText('Adjust time range or category filters', centerX, centerY + 14);
}
