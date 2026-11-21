# زُمُرّدة | Zomoruda Store

[زيارة متجر زمردة](https://zomoruda-store.osaco-zomoruda.workers.dev)

متجر هدايا عربي (RTL) لمحل **زُمُرّدة** في غزة — الرمال، مفترق البلميرا.
Next.js 16 (App Router) · TypeScript · Tailwind · Supabase · Cloudflare Workers · zod · zustand · recharts · vitest.

الطلب يُحفظ في قاعدة البيانات ثم يفتح واتساب المتجر برسالة مرتّبة (بدون دفع إلكتروني: كاش عند الاستلام أو تحويل مع صورة الإيصال).

---

## التشغيل محلياً

```bash
npm install
cp .env.example .env.local   # يمكن تركه فارغاً للوضع التجريبي
npm run dev                  # http://localhost:3000
```

**الوضع التجريبي (Demo mode):** محلياً، إذا لم تُضبط متغيرات Supabase يعمل المتجر ولوحة التحكم ببيانات تجريبية في الذاكرة (8 أقسام، 5 مناسبات، 3 مناطق، 12 منتج، طلبات وزبائن نموذجية). البيانات تُمسح عند إعادة التشغيل. بيئتا Vercel Production وPreview تتطلبان Supabase ولا تستخدمان بيانات العرض.

- لوحة التحكم: `/admin` — اسم المستخدم `admin` وكلمة المرور قيمة `ADMIN_DEMO_PASSWORD` (الافتراضي `admin`).
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
2. طبّقي جميع الملفات في `supabase/migrations/` بالترتيب الرقمي. شغّلي `supabase/seed.sql` فقط إذا أردتِ بيانات العرض التجريبية.
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

## النشر على Cloudflare Workers

1. اربطي المستودع `osaco/zomoruda-store` مع Workers Builds. استخدمي `npm run build:worker` للبناء و`npm run deploy:worker` للنشر، مع مجلد المشروع الجذر.
2. أضيفي `NEXT_PUBLIC_SITE_URL` (رابط المتجر على Cloudflare)، و`NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY` في **Build variables and secrets** وفي **Variables and Secrets** للـ Worker. أضيفي `NEXT_PUBLIC_WHATSAPP_NUMBER` عند الحاجة لتغيير رقم المتجر.
3. في إعدادات تشغيل الـ Worker أضيفي `SUPABASE_SERVICE_ROLE_KEY` و`AUTH_SECRET` و`CRON_SECRET` و`ADMIN_LOGIN_PASSWORD` كأسرار. انقلي قيمة `AUTH_SECRET` الحالية للحفاظ على صلاحية رموز الطلبات، واضبطي `ADMIN_LOGIN_USERNAME` إذا كان مختلفاً عن الاسم الافتراضي. أسرار قاعدة البيانات والإدارة تُستخدم أثناء التشغيل.
4. تحققي من الكتالوج ولوحة الإدارة قبل إيقاف Vercel. جدول الصيانة في `wrangler.jsonc` يعمل يومياً الساعة 18:00 UTC ويستدعي نفس مسار صيانة الطلبات.

يثبّت المشروع نسخة مكتبة `cookie` الخاصة بـ `@opennextjs/aws` لأن محوّل OpenNext 4.2.0 يتوقع تصديراً افتراضياً عند قراءة كوكي الجلسة. عند ترقية المحوّل، اختبري الدخول من المتصفح ثم أعيدي تحميل `/admin` قبل إزالة التثبيت.

للمعاينة المحلية في بيئة Workers، شغّلي `npm run build:worker` ثم `npm run preview:worker`. اضبطي متغيرات `.env.local` وملف `.dev.vars` محلياً عند الحاجة. النشر المباشر يتطلب تفويض `npx wrangler login`.

## البنية

راجعي [ARCHITECTURE.md](./ARCHITECTURE.md) لشرح طبقات المشروع ولماذا صُمّم بهذه الطريقة.

### إعداد بوكس هدايا

من **الإدارة ← المنتجات**، فعّلي «يمكن إضافته داخل بوكس هدية» على المنتجات التي ستُباع كإضافات. أنشئي منتج البوكس وحددي سعره وسعته، ثم اختاري كل الإضافات أو حددي قائمة خاصة به. للمنتج المصنوع حسب الطلب اختاري حالة «حسب الطلب» وفعّلي حقول الاسم والصورة وبطاقة الإهداء المطلوبة وأسعارها. استخدمي «إضافة خيار للمنتج» لإدخال الألوان أو الأحجام أو نوع الورد وفرق سعر كل اختيار.

تزيل مهمة الصيانة اليومية مرفقات السلات المتروكة بعد ثلاثة أيام، وصور الطباعة والإيصالات المرتبطة بالطلبات بعد 90 يوماً من آخر انتقال للتسليم أو الإلغاء. يحتفظ النظام بالملف المشترك ما دام أحد طلباته ضمن فترة الاحتفاظ.
