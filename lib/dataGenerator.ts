import { DataPoint, AggregatedDataPoint, AggregationPeriod, TimeRange } from './types';

const CATEGORIES = ['Series A', 'Series B', 'Series C', 'Series D', 'Series E'];

function generatePoint(timestamp: number, category: string, baseValue: number): DataPoint {
  const hourOfDay = (timestamp % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000);
  const dailyPattern = Math.sin((hourOfDay / 24) * Math.PI * 2) * 20;
  const noise = (Math.random() - 0.5) * 30;
  const categoryOffset = CATEGORIES.indexOf(category) * 15;
  const value = Math.max(0, Math.min(100, baseValue + dailyPattern + noise + categoryOffset));

  return { timestamp, value, category };
}

export function generateDataBatch(
  count: number,
  startTime: number,
  intervalMs: number = 1000
): DataPoint[] {
  const pointsPerCategory = Math.ceil(count / CATEGORIES.length);
  const points: DataPoint[] = new Array(pointsPerCategory * CATEGORIES.length);

  let idx = 0;
  for (let i = 0; i < pointsPerCategory; i++) {
    const timestamp = startTime + i * intervalMs;
    for (const category of CATEGORIES) {
      points[idx++] = generatePoint(timestamp, category, 50);
    }
  }

  return points;
}

export function generateStreamPoint(timestamp: number): DataPoint {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  return generatePoint(timestamp, category, 50);
}

export function getCategories(): string[] {
  return [...CATEGORIES];
}

export function filterData(
  data: DataPoint[],
  categories: string[],
  timeRange: TimeRange | null
): DataPoint[] {
  const catSet = new Set(categories);
  const result: DataPoint[] = [];
  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    if (!catSet.has(p.category)) continue;
    if (timeRange && (p.timestamp < timeRange.start || p.timestamp > timeRange.end)) continue;
    result.push(p);
  }
  return result;
}

function periodToMs(period: AggregationPeriod): number {
  switch (period) {
    case '1min': return 60 * 1000;
    case '5min': return 5 * 60 * 1000;
    case '1hour': return 60 * 60 * 1000;
  }
}

export function aggregateData(
  data: DataPoint[],
  period: AggregationPeriod
): AggregatedDataPoint[] {
  if (data.length === 0) return [];

  const bucketMs = periodToMs(period);
  const buckets = new Map<string, { sum: number; min: number; max: number; count: number; category: string }>();

  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const bucketTime = Math.floor(point.timestamp / bucketMs) * bucketMs;
    const key = `${bucketTime}-${point.category}`;

    const existing = buckets.get(key);
    if (existing) {
      existing.sum += point.value;
      existing.min = Math.min(existing.min, point.value);
      existing.max = Math.max(existing.max, point.value);
      existing.count++;
    } else {
      buckets.set(key, {
        sum: point.value,
        min: point.value,
        max: point.value,
        count: 1,
        category: point.category,
      });
    }
  }

  const result: AggregatedDataPoint[] = new Array(buckets.size);
  let idx = 0;
  for (const [key, bucket] of buckets) {
    const timestamp = parseInt(key.split('-')[0], 10);
    result[idx++] = {
      timestamp,
      avg: bucket.sum / bucket.count,
      min: bucket.min,
      max: bucket.max,
      count: bucket.count,
      category: bucket.category,
    };
  }

  result.sort((a, b) => a.timestamp - b.timestamp);
  return result;
}
