import { NextResponse } from 'next/server';
import { generateDataBatch } from '@/lib/dataGenerator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countParam = searchParams.get('count');
  const count = countParam ? Math.min(parseInt(countParam, 10), 50000) : 10000;

  if (isNaN(count) || count < 1) {
    return NextResponse.json({ error: 'Invalid count parameter' }, { status: 400 });
  }

  // Generate data ending at current time
  const now = Date.now();
  const intervalMs = 1000; // 1 second between points
  const totalDuration = (count / 5) * intervalMs; // 5 categories
  const startTime = now - totalDuration;

  const data = generateDataBatch(count, startTime, intervalMs);

  return NextResponse.json({
    data,
    meta: {
      count: data.length,
      startTime,
      endTime: now,
      categories: ['cpu', 'memory', 'network', 'disk', 'latency'],
    },
  });
}
