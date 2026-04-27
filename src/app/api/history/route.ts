// src/app/api/history/route.ts
// GET /api/history?asset=gold&type=metal&range=1M
// Returns price history for charts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { withCache, CacheKeys } from '@/lib/cache/redis';
import { fetchCryptoHistory } from '@/lib/api/crypto';
import type { PriceHistoryPoint, TimeRange } from '@/types';

export const dynamic = 'force-dynamic';

// Map TimeRange to days
const RANGE_TO_DAYS: Record<TimeRange, number> = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const asset = searchParams.get('asset') ?? 'gold';
  const type = searchParams.get('type') ?? 'metal'; // 'metal' | 'crypto' | 'forex'
  const range = (searchParams.get('range') ?? '1M') as TimeRange;
  const currency = searchParams.get('currency') ?? 'EGP';

  const days = RANGE_TO_DAYS[range] ?? 30;
  const cacheKey = type === 'crypto'
    ? CacheKeys.cryptoHistory(asset, range)
    : CacheKeys.metalHistory(asset, range);

  try {
    const data = await withCache<PriceHistoryPoint[]>(
      cacheKey,
      async () => {
        if (type === 'crypto') {
          // CoinGecko provides history
          return fetchCryptoHistory(asset, days);
        }

        if (type === 'metal') {
          // Pull from our DB
          const since = new Date();
          since.setDate(since.getDate() - days);

          const records = await prisma.metalPrice.findMany({
            where: {
              metal: asset as 'gold' | 'silver' | 'platinum',
              currency: currency as 'EGP' | 'USD',
              createdAt: { gte: since },
            },
            orderBy: { createdAt: 'asc' },
            select: { createdAt: true, pricePerGram: true },
          });

          if (records.length > 0) {
            return records.map(r => ({
              date: r.createdAt.toISOString(),
              price: r.pricePerGram,
            }));
          }

          // Fallback: generate synthetic history for demo
          return generateSyntheticHistory(asset, days, currency);
        }

        if (type === 'forex') {
          const since = new Date();
          since.setDate(since.getDate() - days);

          const records = await prisma.forexRate.findMany({
            where: {
              pair: asset,
              createdAt: { gte: since },
            },
            orderBy: { createdAt: 'asc' },
            select: { createdAt: true, rate: true },
          });

          if (records.length > 0) {
            return records.map(r => ({ date: r.createdAt.toISOString(), price: r.rate }));
          }

          return generateSyntheticHistory('usd', days, 'EGP');
        }

        return [];
      },
      // History changes less frequently — cache longer
      range === '1D' ? 300 : 3600
    );

    return NextResponse.json({ success: true, data, asset, range, type });
  } catch (error) {
    console.error('[API /history]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}

// ─── Synthetic history for when DB has insufficient data ────────────────────
const BASE_PRICES: Record<string, Record<string, number>> = {
  gold:     { EGP: 3100, USD: 75 },
  silver:   { EGP: 38, USD: 0.95 },
  platinum: { EGP: 2500, USD: 58 },
  usd:      { EGP: 48.5, USD: 1 },
};

function generateSyntheticHistory(
  asset: string,
  days: number,
  currency: string
): PriceHistoryPoint[] {
  const base = BASE_PRICES[asset]?.[currency] ?? 100;
  const volatility = asset === 'gold' ? 0.008 : asset === 'silver' ? 0.012 : 0.015;
  const points: PriceHistoryPoint[] = [];
  let price = base;

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    price = price * (1 + (Math.random() - 0.48) * volatility);
    points.push({
      date: d.toISOString(),
      price: Math.round(price * 100) / 100,
    });
  }
  return points;
}
