// src/app/api/forex/route.ts
// GET /api/forex  → returns latest FX rates

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withCache, CacheKeys } from '@/lib/cache/redis';
import { fetchForexRates } from '@/lib/api/forex';
import type { ForexRate } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const forceRefresh = req.nextUrl.searchParams.get('refresh') === '1';

  try {
    const data = await withCache<ForexRate[]>(
      CacheKeys.forex(),
      async () => {
        const records = await prisma.$queryRawUnsafe<ForexRate[]>(`
          SELECT DISTINCT ON (pair) *
          FROM "ForexRate"
          ORDER BY pair, "createdAt" DESC
        `);

        if (records.length > 0 && !forceRefresh) return records;

        const fresh = await fetchForexRates();
        await Promise.all(
          fresh.map(r => prisma.forexRate.create({ data: r }).catch(() => null))
        );
        return fresh;
      },
      forceRefresh ? 1 : Number(process.env.CACHE_TTL_PRICES ?? 300)
    );

    return NextResponse.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[API /forex]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch forex rates' }, { status: 500 });
  }
}
