# زُمُرّدة | Zomoruda Store

متجر هدايا عربي (RTL) لمحل **زُمُرّدة** في غزة — الرمال، مفترق البلميرا.
Next.js 16 (App Router) · TypeScript · Tailwind · Supabase · Vercel · zod · zustand · recharts · vitest.

الطلب يُحفظ في قاعدة البيانات ثم يفتح واتساب المتجر برسالة مرتّبة (بدون دفع إلكتروني: كاش عند الاستلام أو تحويل مع صورة الإيصال).

---

## التشغيل محلياً

```bash
npm install
cp .env.example .env.local   # يمكن تركه فارغاً للوضع التجريبي
npm run dev                  # http://localhost:3000
```

**الوضع التجريبي (Demo mode):** محلياً، إذا لم تُضبط متغيرات Supabase يعمل المتجر ولوحة التحكم ببيانات تجريبية في الذاكرة (8 أقسام، 5 مناسبات، 3 مناطق، 12 منتج، طلبات وزبائن نموذجية). البيانات تُمسح عند إعادة التشغيل. بيئتا Vercel Production وPreview تتطلبان Supabase ولا تستخدمان بيانات العرض.

- لوحة التحكم: `/admin` — كلمة المرور التجريبية: قيمة `ADMIN_DEMO_PASSWORD` (الافتراضي `zomoruda2026`).
- كوبونات للتجربة: `WELCOME10` (10% فوق 50₪) و `GIFT5` (5₪ فوق 40₪).

## الأوامر

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل للتطوير |
| `npm run build` | بناء الإنتاج |
| `npm run typecheck` | فحص TypeScript |
| `npm run lint` | ESLint |
| `npm run test` | اختبارات vitest (تسعير، كوبونات، أرقام الجوال، إنشاء الطلب، التقارير، CRM) |
| `npx tsx scripts/generate-seed-sql.ts` | توليد `supabase/seed.sql` من بيانات العرض |

## ربط Supabase

1. أنشئي مشروعاً على supabase.com.
2. SQL Editor ← شغّلي `supabase/migrations/0001_init.sql` ثم `supabase/migrations/0002_production_hardening.sql` ثم `supabase/migrations/0003_rls_and_indexes.sql`. شغّلي `supabase/seed.sql` فقط إذا أردتِ بيانات العرض التجريبية.
3. Authentication ← Users ← أضيفي مستخدم المدير (بريد + كلمة مرور).
4. أضيفيه كمدير:
   ```sql
   insert into admin_users (user_id, email, role)
   select id, email, 'admin' from auth.users where email = 'owner@example.com';
   ```
5. ضعي في `.env.local` (أو Vercel):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
6. أعيدي التشغيل — التطبيق ينتقل تلقائياً من البيانات التجريبية إلى Supabase. **لا يلزم تعديل أي كود.**

حاويات التخزين (Storage) تُنشأ من الـ migration: `products` (عامة لصور المنتجات) و `uploads` (خاصة لإيصالات التحويل وصور الطباعة، تُفتح من لوحة التحكم برابط مؤقت).

## النشر على Vercel

1. Import للمستودع `osaco/zomoruda-store`.
2. Environment Variables في Production وPreview:
   - `NEXT_PUBLIC_SITE_URL` = رابط الموقع النهائي
   - `AUTH_SECRET` = نص عشوائي 32+ حرف (`openssl rand -base64 32`)
   - `CRON_SECRET` = نص عشوائي بطول 32+ حرفاً
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   لا تضعي مفاتيح الخدمة في متغيرات تبدأ بـ`NEXT_PUBLIC_`. التطبيق يرفض بيانات العرض في البيئتين.
3. Deploy. ملف `vercel.json` يضيف cron يومي `/api/cron/keepalive` حتى لا يتوقف مشروع Supabase المجاني لعدم النشاط.

## البنية

راجعي [ARCHITECTURE.md](./ARCHITECTURE.md) لشرح طبقات المشروع ولماذا صُمّم بهذه الطريقة.
