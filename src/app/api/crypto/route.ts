// src/app/api/crypto/route.ts
// GET /api/crypto  → returns latest crypto prices

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withCache, CacheKeys } from '@/lib/cache/redis';
import { fetchCryptoPrices } from '@/lib/api/crypto';
import type { CryptoPrice } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const forceRefresh = req.nextUrl.searchParams.get('refresh') === '1';

  try {
    const data = await withCache<CryptoPrice[]>(
      CacheKeys.crypto(),
      async () => {
        // Pull most recent price per symbol from DB
        const records = await prisma.$queryRawUnsafe<CryptoPrice[]>(`
          SELECT DISTINCT ON (symbol) *
          FROM "CryptoPrice"
          ORDER BY symbol, "createdAt" DESC
        `);

        if (records.length > 0 && !forceRefresh) return records;

        // Fetch fresh and persist
        const fresh = await fetchCryptoPrices();
        await Promise.all(
          fresh.map(c => prisma.cryptoPrice.create({ data: c }).catch(() => null))
        );
        return fresh;
      },
      forceRefresh ? 1 : Number(process.env.CACHE_TTL_PRICES ?? 300)
    );

    return NextResponse.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[API /crypto]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch crypto prices' }, { status: 500 });
  }
}
