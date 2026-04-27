// src/app/api/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  assetType: z.enum(['metal', 'crypto', 'forex']),
  assetId: z.string().min(1),
  condition: z.enum(['above', 'below']),
  targetPrice: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    await prisma.priceAlert.create({ data: body });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
  }
}
