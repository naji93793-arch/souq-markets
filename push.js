const { execSync } = require('child_process');

// تعريف الرابط يدوياً داخل الكود
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_COP4WZd7ADXN@ep-tiny-math-anb0ykvj.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

try {
    console.log("جاري رفع الجداول لـ Neon...");
    execSync('npx prisma@6.0.0 db push', { stdio: 'inherit' });
    
    console.log("\nجاري حقن البيانات (Seed)...");
    execSync('npx prisma@6.0.0 db seed', { stdio: 'inherit' });
    
    console.log("\n🚀 مبروك! قاعدة البيانات جاهزة تماماً.");
} catch (error) {
    console.error("حدث خطأ أثناء التنفيذ:", error.message);
}