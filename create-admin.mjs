import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_COP4WZd7ADXN@ep-tiny-math-anb0ykvj.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  const email = 'admin@batora.com';
  const password = 'admin123'; // تقدر تغيره لو حابب
  
  console.log('🚀 Encrypting password and connecting...');
  
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.adminUser.upsert({
      where: { email },
      update: {
        passwordHash: hashedPassword // تحديث الباسورد القديم بالجديد المشفر صح
      },
      create: {
        email,
        name: 'Mohamed Atef',
        passwordHash: hashedPassword,
        role: 'superadmin',
      },
    });
    console.log('✅ Admin updated with NEW encrypted password!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${password}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();