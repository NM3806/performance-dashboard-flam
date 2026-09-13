'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { DataPoint, FilterState, TimeRange, AggregationPeriod } from '@/lib/types';
import { generateDataBatch, getCategories } from '@/lib/dataGenerator';
import { useDataStream } from '@/hooks/useDataStream';

interface DataContextValue {
  dataRef: React.MutableRefObject<DataPoint[]>;
  dataVersion: number;
  totalPoints: number;
  filterState: FilterState;
  setSelectedCategories: (categories: string[]) => void;
  clearFilters: () => void;
  setTimeRange: (range: TimeRange | null) => void;
  setAggregation: (period: AggregationPeriod) => void;
  resetViewVersion: number;
  resetView: () => void;
  isStreaming: boolean;
  setStreamingEnabled: (enabled: boolean) => void;
  stressMode: boolean;
  setStressMode: (enabled: boolean) => void;
  dataPointTarget: number;
  setDataPointTarget: (count: number) => void;
  resetData: () => void;
  categories: string[];
}

const DataContext = createContext<DataContextValue | null>(null);

const DEFAULT_POINT_COUNT = 10000;

function createInitialBatch(count: number, catCount: number): DataPoint[] {
  const now = 1700000000000;
  const intervalMs = 1000;
  const totalDuration = (count / catCount) * intervalMs;
  return generateDataBatch(count, now - totalDuration, intervalMs);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const categories = useMemo(() => getCategories(), []);

  const dataRef = useRef<DataPoint[]>(createInitialBatch(DEFAULT_POINT_COUNT, categories.length));

  const [dataVersion, setDataVersion] = useState(1);
  const [totalPoints, setTotalPoints] = useState(DEFAULT_POINT_COUNT);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [stressMode, setStressMode] = useState(false);
  const [dataPointTarget, setDataPointTarget] = useState(DEFAULT_POINT_COUNT);
  const [resetViewVersion, setResetViewVersion] = useState(0);

  const [filterState, setFilterState] = useState<FilterState>({
    categories: categories,
    timeRange: null,
    aggregation: '1min',
  });

  const updateTickRef = useRef(0);
  const handleNewPoint = useCallback(() => {
    updateTickRef.current++;
    const threshold = stressMode ? 2 : 5;
    if (updateTickRef.current >= threshold) {
      updateTickRef.current = 0;
      setDataVersion((v) => v + 1);
      setTotalPoints(dataRef.current.length);
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

  const handleSetTarget = useCallback(
    (count: number) => {
      setDataPointTarget(count);
      const now = Date.now();
      const intervalMs = 1000;
      const totalDuration = (count / categories.length) * intervalMs;
      dataRef.current = generateDataBatch(count, now - totalDuration, intervalMs);
      setTotalPoints(count);
      setDataVersion((v) => v + 1);
    },
    [categories.length]
  );

  const resetData = useCallback(() => {
    const now = Date.now();
    const intervalMs = 1000;
    const totalDuration = (dataPointTarget / categories.length) * intervalMs;
    const startTime = now - totalDuration;
    dataRef.current = generateDataBatch(dataPointTarget, startTime, intervalMs);
    setTotalPoints(dataPointTarget);
    setDataVersion((v) => v + 1);
  }, [dataPointTarget, categories.length]);

  const value = useMemo<DataContextValue>(
    () => ({
      dataRef,
      dataVersion,
      totalPoints,
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
      setDataPointTarget: handleSetTarget,
      resetData,
      categories,
    }),
    [
      dataVersion,
      totalPoints,
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
      handleSetTarget,
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
