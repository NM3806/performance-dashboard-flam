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
  setTimeRange: (range: TimeRange | null) => void;
  setAggregation: (period: AggregationPeriod) => void;

  // Stream control
  isStreaming: boolean;
  setStreamingEnabled: (enabled: boolean) => void;

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
  const [dataPointTarget, setDataPointTarget] = useState(DEFAULT_POINT_COUNT);

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

  // Real-time streaming — notify consumers every ~500ms to avoid excessive re-renders
  const updateTickRef = useRef(0);
  const handleNewPoint = useCallback(() => {
    updateTickRef.current++;
    // Batch state updates: only bump version every 5 ticks (500ms at 100ms interval)
    if (updateTickRef.current >= 5) {
      updateTickRef.current = 0;
      setDataVersion((v) => v + 1);
    }
  }, []);

  const { isStreaming } = useDataStream(dataRef, {
    enabled: streamingEnabled,
    maxPoints: dataPointTarget,
    onNewPoint: handleNewPoint,
  });

  const setSelectedCategories = useCallback((cats: string[]) => {
    setFilterState((prev) => ({ ...prev, categories: cats }));
  }, []);

  const setTimeRange = useCallback((range: TimeRange | null) => {
    setFilterState((prev) => ({ ...prev, timeRange: range }));
  }, []);

  const setAggregation = useCallback((period: AggregationPeriod) => {
    setFilterState((prev) => ({ ...prev, aggregation: period }));
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
      setTimeRange,
      setAggregation,
      isStreaming,
      setStreamingEnabled,
      dataPointTarget,
      setDataPointTarget,
      resetData,
      categories,
    }),
    [
      dataVersion,
      filterState,
      setSelectedCategories,
      setTimeRange,
      setAggregation,
      isStreaming,
      dataPointTarget,
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
