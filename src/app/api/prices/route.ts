// src/app/api/prices/route.ts
// GET /api/prices?currency=EGP  → returns latest metal prices

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withCache, CacheKeys } from '@/lib/cache/redis';
import { fetchAllMetalPrices } from '@/lib/api/metals';
import type { MetalPrice } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const currency = (req.nextUrl.searchParams.get('currency') ?? 'EGP') as 'EGP' | 'USD';
  const forceRefresh = req.nextUrl.searchParams.get('refresh') === '1';

  try {
    const cacheKey = CacheKeys.metals(currency);

    const data = await withCache<MetalPrice[]>(
      cacheKey,
      async () => {
        // Try to get from DB first (most recent per metal)
        const records = await prisma.$queryRawUnsafe<MetalPrice[]>(`
          SELECT DISTINCT ON (metal) *
          FROM "MetalPrice"
          WHERE currency = $1
          ORDER BY metal, "createdAt" DESC
        `, currency);

        if (records.length > 0 && !forceRefresh) {
          return records;
        }

        // If DB is empty or force refresh, fetch from API and save
        const fresh = await fetchAllMetalPrices();
        const filtered = fresh.filter(m => m.currency === currency);

        // Persist to DB
        await Promise.all(
          fresh.map(m =>
            prisma.metalPrice.create({ data: m }).catch(() => null)
          )
        );

        return filtered;
      },
      forceRefresh ? 1 : Number(process.env.CACHE_TTL_PRICES ?? 300)
    );

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      cached: !forceRefresh,
    });
  } catch (error) {
    console.error('[API /prices]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metal prices' },
      { status: 500 }
    );
  }
}
