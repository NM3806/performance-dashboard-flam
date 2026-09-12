'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { DataPoint, FilterState, TimeRange, AggregationPeriod } from '@/lib/types';
import { generateDataBatch, getCategories } from '@/lib/dataGenerator';
import { useDataStream } from '@/hooks/useDataStream';

interface DataContextValue {
  // Data access — ref for performance, not state
  dataRef: React.MutableRefObject<DataPoint[]>;
  dataVersion: number; // incremented to signal consumers to re-read

  // Filter state
  filterState: FilterState;
  setSelectedCategories: (categories: string[]) => void;
  clearFilters: () => void;
  setTimeRange: (range: TimeRange | null) => void;
  setAggregation: (period: AggregationPeriod) => void;

  // View reset
  resetViewVersion: number;
  resetView: () => void;

  // Stream control
  isStreaming: boolean;
  setStreamingEnabled: (enabled: boolean) => void;

  // Stress test mode
  stressMode: boolean;
  setStressMode: (enabled: boolean) => void;

  // Data load control
  dataPointTarget: number;
  setDataPointTarget: (count: number) => void;
  resetData: () => void;

  // Available categories
  categories: string[];
}

const DataContext = createContext<DataContextValue | null>(null);

const DEFAULT_POINT_COUNT = 10000;
const MAX_POINTS = 50000;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const dataRef = useRef<DataPoint[]>([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [stressMode, setStressMode] = useState(false);
  const [dataPointTarget, setDataPointTarget] = useState(DEFAULT_POINT_COUNT);
  const [resetViewVersion, setResetViewVersion] = useState(0);

  const categories = useMemo(() => getCategories(), []);

  const [filterState, setFilterState] = useState<FilterState>({
    categories: categories,
    timeRange: null,
    aggregation: '1min',
  });

  // Generate initial data
  useEffect(() => {
    const now = Date.now();
    const intervalMs = 1000;
    const totalDuration = (dataPointTarget / 5) * intervalMs;
    const startTime = now - totalDuration;
    dataRef.current = generateDataBatch(dataPointTarget, startTime, intervalMs);
    setDataVersion((v) => v + 1);
  }, []); // only on mount

  // Real-time streaming — notify consumers regularly to avoid excessive re-renders
  const updateTickRef = useRef(0);
  const handleNewPoint = useCallback(() => {
    updateTickRef.current++;
    // In stress mode, update version every 2 ticks (~32ms); in normal mode every 5 ticks (500ms)
    const threshold = stressMode ? 2 : 5;
    if (updateTickRef.current >= threshold) {
      updateTickRef.current = 0;
      setDataVersion((v) => v + 1);
    }
  }, [stressMode]);

  const { isStreaming } = useDataStream(dataRef, {
    enabled: streamingEnabled,
    maxPoints: dataPointTarget,
    intervalMs: stressMode ? 16 : 100,
    batchSize: stressMode ? 5 : 1,
    onNewPoint: handleNewPoint,
  });

  const setSelectedCategories = useCallback((cats: string[]) => {
    setFilterState((prev) => ({ ...prev, categories: cats }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState((prev) => ({ ...prev, categories: [...categories] }));
  }, [categories]);

  const setTimeRange = useCallback((range: TimeRange | null) => {
    setFilterState((prev) => ({ ...prev, timeRange: range }));
  }, []);

  const setAggregation = useCallback((period: AggregationPeriod) => {
    setFilterState((prev) => ({ ...prev, aggregation: period }));
  }, []);

  const resetView = useCallback(() => {
    setFilterState((prev) => ({
      ...prev,
      timeRange: null,
      aggregation: '1min',
    }));
    setResetViewVersion((v) => v + 1);
  }, []);

  const resetData = useCallback(() => {
    const now = Date.now();
    const intervalMs = 1000;
    const totalDuration = (dataPointTarget / 5) * intervalMs;
    const startTime = now - totalDuration;
    dataRef.current = generateDataBatch(dataPointTarget, startTime, intervalMs);
    setDataVersion((v) => v + 1);
  }, [dataPointTarget]);

  const value = useMemo<DataContextValue>(
    () => ({
      dataRef,
      dataVersion,
      filterState,
      setSelectedCategories,
      clearFilters,
      setTimeRange,
      setAggregation,
      resetViewVersion,
      resetView,
      isStreaming,
      setStreamingEnabled,
      stressMode,
      setStressMode,
      dataPointTarget,
      setDataPointTarget,
      resetData,
      categories,
    }),
    [
      dataVersion,
      filterState,
      setSelectedCategories,
      clearFilters,
      setTimeRange,
      setAggregation,
      resetViewVersion,
      resetView,
      isStreaming,
      stressMode,
      dataPointTarget,
      setDataPointTarget,
      resetData,
      categories,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within DataProvider');
  }
  return ctx;
}
