# البنية المعمارية — لماذا هذا المشروع ليس «سباغيتي»

مستوحاة من مشاريع مفتوحة المصدر معروفة: **vercel/commerce** (فصل مزوّد البيانات عن الواجهة)، **Bulletproof React** (التنظيم حسب الميزة feature-first)، و **Medusa storefront** (منطق التسعير في الخادم فقط).

## 1. التنظيم حسب الميزة (Feature-first)

```
src/
  app/                    ← الصفحات فقط (رفيعة): تقرأ البيانات وتركّب المكوّنات
    (store)/              ← واجهة المتجر (Header/Footer/السلة)
    admin/login           ← تسجيل دخول اللوحة
    admin/(panel)/        ← لوحة التحكم (محميّة بـ requireAdmin)
    api/                  ← رفع الصور، cron
  features/               ← كل ميزة في مجلدها
    catalog/  product/  cart/  checkout/  orders/
    auth/  admin/  products-admin/  crm/  reports/  settings/  uploads/
      components/         ← واجهة الميزة
      server/             ← queries.ts (قراءة) و actions.ts ("use server")
      lib/                ← منطق صافٍ (pure) بدون React أو قاعدة بيانات → مُختبر
      schemas.ts          ← zod
  components/ui/          ← مكوّنات تصميم عامة (Button, Card, Badge, Input, Pagination…)
  components/layout/      ← Header, Footer, BottomNav…
  lib/data/               ← طبقة الوصول للبيانات (Repository pattern)
  lib/                    ← env, pricing, phone, format, signing…
  types/                  ← أنواع الدومين + enums مع تسمياتها العربية
```

اتجاه الاعتماد دائماً: `app → features → lib`. لا توجد صفحة تتكلم مع Supabase مباشرة.

## 2. طبقة البيانات (Repository pattern)

`src/lib/data/repositories.ts` يعرّف **عقوداً** (interfaces) لكل جدول. يوجد تطبيقان:

- `demo/` — بيانات في الذاكرة (تجريبي، بدون أي إعداد).
- `supabase/` — قاعدة البيانات الحقيقية + mappers تحوّل `snake_case` ↔ `camelCase`.

`getRepos()` يختار التطبيق حسب متغيرات البيئة. **تغيير قاعدة البيانات لا يلمس أي صفحة.**

## 3. الأمان والتسعير

- الخادم **يعيد حساب كل الأسعار** (`features/checkout/lib/build-order.ts`): سعر المنتج وفروق الخيارات من قاعدة البيانات، لا من المتصفح. أي خيار غير موجود يُرفض.
- كل server action: تحقق zod ← صلاحيات ← منطق ← نتيجة مُنمّطة `Result<T>` (لا استثناءات عبر الشبكة).
- جلسة المدير: كوكي `httpOnly` موقّعة HMAC، والأدوار `admin` / `staff`.
- صفحة نجاح الطلب محمية برمز موقّع؛ التتبّع يتطلب رقم الطلب + رقم الجوال معاً.
- RLS مفعّل على كل الجداول: المفتاح العام يقرأ الكتالوج النشط فقط.
- المفاتيح السرية في `server-env.ts` مع `server-only` حتى لا تتسرب للمتصفح.

## 4. الاختبارات

`tests/` — منطق صافٍ + اختبار تكامل لإنشاء الطلب كاملاً (تحقق ← تسعير ← حفظ ← خصم المخزون ← تحديث الزبون ← استهلاك الكوبون).

## 5. إضافة ميزة جديدة (مثال)

1. أضيفي النوع في `types/db.ts` والدالة في عقد الـ repository.
2. طبّقيها في `demo/` و `supabase/`.
3. أنشئي `features/<name>/` بمكوّناتها و actions.
4. الصفحة في `app/` تستدعي الميزة فقط.

الجداول البسيطة في اللوحة (أقسام، مناسبات، بانرات، مناطق، كوبونات) تُدار من **إعداد واحد** في `features/admin/entities/config.ts` — إضافة جدول بسيط جديد = إضافة عنصر للإعداد.
