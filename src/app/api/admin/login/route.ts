// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { comparePassword, signAdminToken } from '@/lib/utils/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signAdminToken({ id: user.id, email: user.email, role: user.role });

  return NextResponse.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
