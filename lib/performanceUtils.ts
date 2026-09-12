// Format bytes to MB
export function formatMemory(bytes: number | null): string {
  if (bytes === null) return '—';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

// Check if memory API is available
export function getMemoryUsage(): number | null {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return null;
}
