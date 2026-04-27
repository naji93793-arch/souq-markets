// prisma/seed.ts
// Run: npm run db:seed
// Creates the first admin user

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default superadmin
  const hash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@souq.local' },
    update: {},
    create: {
      email: 'admin@souq.local',
      passwordHash: hash,
      name: 'Super Admin',
      role: 'superadmin',
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('   Password: admin123  ← CHANGE THIS IN PRODUCTION!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
