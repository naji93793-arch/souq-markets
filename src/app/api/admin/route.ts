// src/app/api/admin/route.ts
// POST /api/admin/refresh → trigger price refresh
// POST /api/admin/override → manual price override

import { NextRequest, NextResponse } from 'next/server';
import { refreshAllPrices } from '@/lib/api/scheduler';
import prisma from '@/lib/db/prisma';
import { verifyAdminToken } from '@/lib/utils/auth';
import { cacheDel, CacheKeys } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';

// Verify the incoming request has a valid admin JWT
async function requireAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return verifyAdminToken(auth.slice(7));
}

// POST /api/admin  — body: { action: 'refresh' | 'override' | 'prune', ...payload }
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  switch (body.action) {

    // ── Trigger immediate price refresh ────────────────────────────────────
    case 'refresh': {
      const result = await refreshAllPrices();
      return NextResponse.json({ success: true, result });
    }

    // ── Manual price override ──────────────────────────────────────────────
    case 'override': {
      const { assetType, assetId, field, value, note } = body;
      if (!assetType || !assetId || !field || value == null) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
      }

      await prisma.priceOverride.create({
        data: { assetType, assetId, field, value: Number(value), note, createdBy: admin.email },
      });

      // Invalidate relevant cache
      if (assetType === 'metal') {
        await cacheDel(CacheKeys.metals('EGP'));
        await cacheDel(CacheKeys.metals('USD'));
      } else if (assetType === 'crypto') {
        await cacheDel(CacheKeys.crypto());
      } else if (assetType === 'forex') {
        await cacheDel(CacheKeys.forex());
      }
      await cacheDel(CacheKeys.dashboard());

      return NextResponse.json({ success: true, message: 'Override saved' });
    }

    // ── List current overrides ─────────────────────────────────────────────
    case 'list_overrides': {
      const overrides = await prisma.priceOverride.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return NextResponse.json({ success: true, data: overrides });
    }

    // ── Deactivate an override ─────────────────────────────────────────────
    case 'remove_override': {
      const { id } = body;
      await prisma.priceOverride.update({
        where: { id: Number(id) },
        data: { active: false },
      });
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  }
}

// GET /api/admin — health check + stats
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const [metalCount, cryptoCount, forexCount] = await Promise.all([
    prisma.metalPrice.count(),
    prisma.cryptoPrice.count(),
    prisma.forexRate.count(),
  ]);

  const latestMetal = await prisma.metalPrice.findFirst({ orderBy: { createdAt: 'desc' } });

  return NextResponse.json({
    success: true,
    stats: {
      metalRecords: metalCount,
      cryptoRecords: cryptoCount,
      forexRecords: forexCount,
      lastUpdate: latestMetal?.createdAt ?? null,
    },
  });
}
