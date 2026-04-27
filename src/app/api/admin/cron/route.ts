// src/app/api/admin/cron/route.ts
// Called by Vercel Cron / external scheduler every 5 minutes
// Vercel.json: { "crons": [{ "path": "/api/admin/cron", "schedule": "*/5 * * * *" }] }

import { NextRequest, NextResponse } from 'next/server';
import { refreshAllPrices } from '@/lib/api/scheduler';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // allow up to 60s for API calls

export async function GET(req: NextRequest) {
  // Verify Vercel Cron secret (set CRON_SECRET in env vars)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await refreshAllPrices();
    console.log('[Cron] Price refresh complete:', result);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error('[Cron] Price refresh failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
