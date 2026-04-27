# سوق Markets — دليل التشغيل الكامل
### Live Gold, Silver, Crypto & FX Dashboard for Egypt

---

## 📁 هيكل المشروع

```
market-dashboard/
├── prisma/
│   ├── schema.prisma        # نماذج قاعدة البيانات
│   └── seed.ts              # بيانات أولية (مستخدم الإدارة)
├── src/
│   ├── app/
│   │   ├── page.tsx         # الصفحة الرئيسية
│   │   ├── layout.tsx       # Root layout + SEO
│   │   ├── globals.css
│   │   ├── admin/page.tsx   # لوحة الإدارة
│   │   └── api/
│   │       ├── prices/      # GET أسعار المعادن
│   │       ├── crypto/      # GET أسعار العملات المشفرة
│   │       ├── forex/       # GET أسعار الصرف
│   │       ├── history/     # GET سجل الأسعار للرسوم البيانية
│   │       ├── alerts/      # POST تنبيهات الأسعار
│   │       └── admin/       # POST/GET لوحة التحكم
│   ├── components/
│   │   ├── layout/          # Header, Providers
│   │   ├── cards/           # HeroTicker, MetalsSection, CryptoSection, ForexSection, AlertSubscription
│   │   ├── charts/          # PriceChart (Recharts)
│   │   └── ui/              # PriceChange badge
│   ├── lib/
│   │   ├── api/             # metals.ts, crypto.ts, forex.ts, scheduler.ts
│   │   ├── db/              # prisma.ts singleton
│   │   ├── cache/           # redis.ts (Redis + in-memory fallback)
│   │   └── utils/           # auth.ts, cn.ts
│   ├── store/               # Zustand global state
│   ├── types/               # TypeScript interfaces
│   └── i18n/                # ترجمات عربي/إنجليزي
├── .env.example
├── package.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🚀 التشغيل المحلي — خطوة بخطوة

### المتطلبات المسبقة
- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **PostgreSQL** 14+ — [postgresql.org](https://www.postgresql.org/download/)
- **Redis** (اختياري، يوجد fallback في الذاكرة إذا لم يكن متاحاً)

---

### الخطوة 1 — تحميل وتثبيت المشروع

```bash
# فك الضغط عن المشروع ثم:
cd market-dashboard

# تثبيت المكتبات
npm install
```

---

### الخطوة 2 — إعداد متغيرات البيئة

```bash
# نسخ ملف المتغيرات
cp .env.example .env
```

افتح `.env` وعدّل هذه القيم:

```env
# قاعدة البيانات (مطلوب)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/market_dashboard"

# مفاتيح APIs (مطلوبة للبيانات الحقيقية — بدونها يعمل بـ Demo Data)
GOLDAPI_KEY="احصل عليه من https://www.goldapi.io"
EXCHANGERATE_API_KEY="احصل عليه من https://www.exchangerate-api.com"

# JWT Secret (غيّره لقيمة عشوائية طويلة)
JWT_SECRET="change-me-to-random-string-min-32-chars"
NEXTAUTH_SECRET="another-random-string"
```

> **ملاحظة:** المشروع يعمل **بدون أي API keys** باستخدام بيانات تجريبية واقعية. يمكنك تشغيله فوراً لرؤية الواجهة.

---

### الخطوة 3 — إنشاء قاعدة البيانات

```bash
# إنشاء قاعدة البيانات في PostgreSQL
psql -U postgres -c "CREATE DATABASE market_dashboard;"

# تطبيق نماذج Prisma على قاعدة البيانات
npm run db:push

# إنشاء أول مستخدم إداري
npm run db:seed
```

سيظهر:
```
✅ Admin user created: admin@souq.local
   Password: admin123  ← CHANGE THIS IN PRODUCTION!
```

---

### الخطوة 4 — تشغيل التطبيق

```bash
npm run dev
```

افتح المتصفح على: **http://localhost:3000**

- لوحة الإدارة: **http://localhost:3000/admin**
  - البريد: `admin@souq.local`
  - كلمة السر: `admin123`

---

## 🔑 الحصول على مفاتيح API المجانية

| API | الاستخدام | الخطة المجانية | الرابط |
|-----|-----------|----------------|--------|
| **GoldAPI.io** | أسعار الذهب والفضة | 50 طلب/شهر | [goldapi.io](https://www.goldapi.io) |
| **ExchangeRate-API** | أسعار الصرف USD/EGP | 1,500 طلب/شهر | [exchangerate-api.com](https://www.exchangerate-api.com) |
| **CoinGecko** | أسعار العملات المشفرة | مجاني بدون مفتاح | [coingecko.com/api](https://www.coingecko.com/api) |

---

## 📦 البناء للإنتاج

```bash
# بناء المشروع
npm run build

# تشغيل نسخة الإنتاج
npm start
```

---

## ☁️ النشر على Vercel (موصى به)

### الطريقة السريعة — Vercel CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel

# أو للإنتاج مباشرة
vercel --prod
```

### الإعداد على لوحة Vercel

1. اذهب إلى [vercel.com](https://vercel.com) وأنشئ مشروعاً جديداً
2. اربطه بمستودع GitHub الخاص بك
3. في **Environment Variables** أضف:
   ```
   DATABASE_URL        = (رابط Neon.tech أو Supabase PostgreSQL)
   GOLDAPI_KEY         = مفتاحك
   EXCHANGERATE_API_KEY = مفتاحك
   JWT_SECRET          = نص عشوائي طويل
   NEXTAUTH_SECRET     = نص عشوائي آخر
   REDIS_URL           = (اختياري - Upstash Redis)
   ```

### قاعدة بيانات مجانية على السحاب

```bash
# خيار 1: Neon.tech (PostgreSQL مجاني)
# اذهب لـ neon.tech وأنشئ مشروعاً — احصل على DATABASE_URL

# خيار 2: Supabase (PostgreSQL مجاني)
# اذهب لـ supabase.com — احصل على DATABASE_URL

# خيار 3: Railway
# اذهب لـ railway.app — PostgreSQL مجاني مع 5GB
```

### Redis مجاني للـ Caching (اختياري)

```bash
# Upstash — Redis serverless مجاني
# اذهب لـ upstash.com وأنشئ Database
# احصل على UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN
```

---

## ⚙️ التحديث التلقائي للأسعار

### على Vercel — Cron Jobs

أضف ملف `vercel.json` في جذر المشروع:

```json
{
  "crons": [
    {
      "path": "/api/admin/cron",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

ثم أنشئ `src/app/api/admin/cron/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { refreshAllPrices } from '@/lib/api/scheduler';

export async function GET(req: Request) {
  // تحقق من Vercel Cron secret
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await refreshAllPrices();
  return NextResponse.json({ success: true, result });
}
```

أضف `CRON_SECRET` في متغيرات البيئة على Vercel.

---

## 🌙 المميزات

| الميزة | الوصف |
|--------|-------|
| ✅ أسعار الذهب والفضة | 24K, 22K, 21K, 18K, 14K بالجنيه والدولار |
| ✅ أسعار العملات المشفرة | Bitcoin, Ethereum, BNB, SOL وغيرها |
| ✅ أسعار الصرف | USD/EGP, EUR/EGP, GBP/EGP, SAR/EGP |
| ✅ رسوم بيانية تفاعلية | يومي / أسبوعي / شهري / سنوي |
| ✅ Dark/Light mode | تبديل الوضع |
| ✅ عربي / إنجليزي | RTL كامل للعربية |
| ✅ تنبيهات بالبريد | عند وصول السعر للهدف |
| ✅ لوحة إدارة | تحديث يدوي وإلغاء تلقائي |
| ✅ Caching | Redis + in-memory fallback |
| ✅ SEO | Meta tags, Open Graph |
| ✅ Mobile-first | متجاوب بالكامل |

---

## 🛠️ استكشاف الأخطاء

**مشكلة: `Cannot connect to database`**
```bash
# تأكد من تشغيل PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql  # Mac
# أو تحقق من DATABASE_URL في .env
```

**مشكلة: `Prisma schema not in sync`**
```bash
npm run db:push
```

**مشكلة: أسعار لا تظهر**
- الأسعار تعمل بـ Demo Data بدون مفاتيح API
- اذهب لـ `/admin` → "Force refresh all prices"

---

## 📄 الترخيص

MIT License — يمكنك التعديل والنشر بحرية.
