interface PerformanceWithMemory {
  memory?: {
    usedJSHeapSize?: number;
  };
}

export function formatMemory(bytes: number | null): string {
  if (bytes === null) return '—';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function getMemoryUsage(): number | null {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const perf = performance as unknown as PerformanceWithMemory;
    return perf.memory?.usedJSHeapSize ?? null;
  }
  return null;
}
