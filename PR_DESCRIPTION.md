# fix+feat: order lifecycle, security hardening, UI refresh

## ملخص التغييرات (Overview)

يقدّم هذا الـ Pull Request تحديثاً شاملاً لدورة حياة الطلبات، تقوية الأمان في الخادم، تحديث الهوية البصرية وتجربة المستخدم في متجر **زُمُرّدة** (`@zomoruda1`)، وتحسينات الأداء والـ SEO، مقسّمة وفق المهام الهندسية من **Block A** إلى **Block F** بالإضافة إلى حزمة إصلاح عقود الأنواع (TypeScript Patch).

---

## تفاصيل التنفيذ حسب الأقسام (Changes by Block)

### 0. Patch — توحيد عقود TypeScript والتسعير (`src/lib/pricing.ts`)
- توحيد تواقيع دوال `validateCoupon` و `calculateDiscount` و `calculateTotals` وتصدير `formatOrderNumber`.
- مطابقة أسماء الحقول بين طبقة البيانات وطبقة التطبيق (`camelCase` / `snake_case`) وإصلاح كافة أخطاء التحقق في `build-order.ts` و `coupon.ts` و `pricing.test.ts`.

### Block A — دورة حياة الطلب وتأكيد واتساب (Order Lifecycle)
- **إعادة التسعير والتحقق في الخادم:** تجاهل أي أسعار أو مجاميع قادمة من المتصفح، وإعادة حساب المجموع الفرعي، الخصم، ورسوم التوصيل في الخادم عبر `buildOrder`.
- **حماية المخزون والكوبونات:** منع استرجاع المخزون الوهمي المتكرر عند حفظ طلب ملغي مسبقاً (`before.status !== "cancelled"`).
- **تنبيه صفحة النجاح ورابط واتساب:** إضافة كتلة التنبيه الصفراء (`border-warning/40 bg-warning/10 text-amber-900`) في `src/app/(store)/order/[number]/page.tsx` لتوضيح أن الطلب محفوظ في النظام وبانتظار إرسال رسالة واتساب لاعتماده، مع استخدام رابط HTML مباشر يتجاوز حظر النوافذ المنبثقة (Popup Blockers).

### Block B — تقوية الأمان وحماية الجلسات (Security Hardening)
- **تقييد معدل الطلبات (Rate Limiting):** ضبط محدد الطلبات في `placeOrder` بناءً على رقم الجوال الموحد (`normalizePsPhone`) إلى طلبين كحد أقصى لكل 10 دقائق (`maxHits: 2`)، بحيث يُرفض الطلب الثالث تلقائياً لمنع استنزاف المخزون.
- **حماية جلسات الإدارة (`requireAdmin`):** تحديث `src/features/auth/session.ts` للتحقق الفوري من حالة تفعيل المشرف (`is_active`) في قاعدة البيانات، وإلغاء الجلسة وتحويله إلى صفحة الدخول فوراً عند تعطيل حسابه، مع حماية صفحة الدخول من هجمات التخمين (Brute-Force).

### Block C — تحديث الهوية البصرية والتجاوب والوصول (UI Refresh & Accessibility)
- **هوية متجر زُمُرّدة:** اعتماد اللون البنفسجي الملكي العميق (`#402761`) وتحويل الشعار في `src/components/layout/Logo.tsx` إلى Vector SVG مضمّن عالي الدقة لمنع أخطاء `404`.
- **التجاوب على الشاشات الصغيرة (`375px`):** ضبط الحواف والحشوات في `HeroSection.tsx` و `globals.css` لمنع أي تمرير أفقي (Horizontal Overflow) على الهواتف.
- **دعم تقليل الحركة (Reduced Motion):** إضافة استعلام `@media (prefers-reduced-motion: reduce)` في `src/app/globals.css` لإيقاف الحركات والانتقالات تلقائياً عند تفعيل الخيار في نظام التشغيل.

### Block D — مؤشر خطوات إتمام الطلب (Checkout Steps)
- تحويل شريط خطوات الدفع إلى قائمة مرتبة `<ol>` غير تفاعلية (إرشادية) بتنسيق `flex` تتحدث تلقائياً حسب القسم النشط في النموذج:
  - الخطوة النشطة: `text-primary font-bold`
  - الخطوة المكتملة: `text-success` مع علامة `✓`
  - الخطوة القادمة: `text-muted`

### Block E — الأداء وتحسين محركات البحث (Performance & SEO)
- **E1 (`LocalBusiness` JSON-LD):** إضافة البيانات المنظمة `application/ld+json` في أسفل الصفحة الرئيسية `src/app/(store)/page.tsx` مع معالجة محارف `<` لمنع ثغرات XSS.
- **E2 (Per-Page Metadata & Canonicals):** إضافة عناوين وأوصاف فريدة وروابط معيارية (`alternates: { canonical }`) لصفحات:
  - `/categories`
  - `/occasions`
  - `/offers`
  - `/contact`
  - `/track`

### Block F — الصفحات التنظيمية المفقودة (Missing Pages)
- **F1 (`src/app/(store)/policy/page.tsx`):** إنشاء صفحة «سياسة الخصوصية والتوصيل» باستخدام `<PageHeader>` وأقسام `.card` تغطي:
  1. سياسة الخصوصية (البيانات التي نجمعها وأغراضها).
  2. سياسة التوصيل (مناطق قطاع غزة، رسوم التوصيل، والحد الأدنى للطلب).
  3. سياسة الاستبدال والاسترجاع.
- إضافة رابط «سياسة الخصوصية والتوصيل» (`→ /policy`) في `Footer.tsx`.

---

## سجل الـ Commits المضمّنة

- `a19f8a4` — `fix(checkout): refine steps ol layout, phone rate-limiting, and order success alert`
- `78305ee` — `feat(seo): add LocalBusiness JSON-LD and unique metadata descriptions with canonicals (Block E)`
- `70eeb91` — `feat(policy): create privacy & delivery policy page and update footer link (Block F)`

---

## نتائج الفحص والتحقق (Verification Checklist)

- [x] `npm run typecheck` — **0 أخطاء**
- [x] `npm run lint` — **0 أخطاء**
- [x] `npm test` — **نجاح 39 / 39 اختباراً** (بما فيها اختبار رفض الطلب الثالث لنفس رقم الهاتف)
- [x] `npm run build` — **نجاح البناء الإنتاجي بالكامل** وتوليد كافة المسارات الثابتة والديناميكية شاملة `/policy`
- [x] ظهور كتلة التنبيه الصفراء في صفحة نجاح الطلب وعمل زر واتساب بدون حظر من المتصفح
- [x] إلغاء جلسة المشرف المعطّل (`is_active = false`) وتحويله لصفحة تسجيل الدخول فوراً
- [x] توافق قسم الـ Hero على عرض `375px` بدون انزياح أفقي، وتوقف الحركات عند تفعيل `prefers-reduced-motion`
- [x] عمل رابط `/policy` من تذييل الموقع (Footer)
