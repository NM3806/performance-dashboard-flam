// Core data types for the performance dashboard

export interface DataPoint {
  timestamp: number;
  value: number;
  category: string;
}

export type ChartType = 'line' | 'bar' | 'scatter' | 'heatmap';

export type AggregationPeriod = '1min' | '5min' | '1hour';

export interface AggregatedDataPoint {
  timestamp: number;
  avg: number;
  min: number;
  max: number;
  count: number;
  category: string;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number | null; // null when browser API unavailable
  renderTime: number;
  dataProcessingTime: number;
  dataPointCount: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface ViewTransform {
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface FilterState {
  categories: string[];
  timeRange: TimeRange | null;
  aggregation: AggregationPeriod;
}
