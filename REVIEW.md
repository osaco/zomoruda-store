# تقرير المراجعة الشاملة لمتجر «زُمُرّدة» (Zomoruda Store Review)

## 1. القرار النهائي (Verdict)

**القرار: FIX FIRST (إصلاح الثغرات والملاحظات أولاً قبل النشر النهائي)**
المشروع مبني بهندسة برمجية متماسكة، أمان ممتاز في إعادة التسعير من جانب الخادم (Server Re-pricing)، وتوافق كامل مع TypeScript وبناء ناجح بدون أخطاء. مع ذلك، توجد ثغرة أمنية تتيح تعطيل حساب المشرف عبر تخمين كلمات المرور (Account Lockout DoS)، وقاعدة بيانات الإنتاج فارغة تماماً من المنتجات على الموقع المباشر، بالإضافة إلى تجاوز اسم العميل عند تكرار رقم الهاتف وغياب صورة بطاقة المشاركة الاجتماعية (OG Image).

---

## 2. جدول البوابات الفنية (Gates)

| البوابة | النتيجة | الدليل الميداني والناتج |
| :--- | :---: | :--- |
| `npm run typecheck` | **PASS** | `0 errors` (TypeScript 5.x فحص صارم لكامل المشروع). |
| `npm run lint` | **PASS** | `0 errors, 0 warnings` (ESLint 9 + Next core-web-vitals). |
| `npm test` | **PASS** | `12 test files passed, 69 tests passed, 0 failed` (Vitest 4.0.8 في 8.4 ثوانٍ). |
| `npm run build` | **PASS** | Next.js 16.4.3، تم توليد 22/22 مساراً بنجاح وحجم الصفحة الأولى المشتركة 102 kB. |
| `npm audit --omit=dev` | **PASS** | `found 0 vulnerabilities` في حزم الإنتاج التشغيلية (Production Dependencies). |
| `npm audit` (مع حزم التطوير) | **PASS** | `7 moderate` جميعها تابعة لمكتبة `minimatch` داخل أدوات التطوير (`@typescript-eslint`). 0 High و 0 Critical. |

---

## 3. جدول النتائج والملاحظات مرتبة حسب الخطورة (Findings Table)

| المعرف (ID) | الخطورة | المجال | الملف والأسطر | الدليل البرمجي المقتبس | الأثر الهندسي / التجاري | الإصلاح المقترح | الجهد | موافقة المالك (R9) |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **F-01** | **HIGH** | أمان الجلسات (Auth) | `src/features/auth/server/actions.ts:32-38` | `isRateLimited("login-account", (serverEnv.ADMIN_LOGIN_USERNAME ?? "admin").toLowerCase(), 5, 15 * 60)` | إمكانية حظر المشرف الشرعي (Denial of Service): أي مهاجم يرسل 5 طلبات خاطئة لصفحة الدخول يقوم باستهلاك العداد العام للحساب لمدة 15 دقيقة ويمنع المشرف من الدخول حتى بكلمة المرور الصحيحة. كما أن القيمة الافتراضية هنا `"admin"` بينما اسم المشرف الافتراضي `"zomoruda2026"`. | تطبيق تقييد معدل الدخول على الـ IP أولاً، وحصر تقييد الحساب بعد التحقق من صحة اسم المستخدم أو استخدام قفل تدريجي، وتوحيد اسم الحساب مع `getStandaloneAdminUsername()`. | S | **نعم (مسار R9 حساس)** |
| **F-02** | **HIGH** | محتوى الإنتاج (Content) | الموقع المباشر Vercel / Supabase | `Live home product links: 0, Categories product links: 0` | واجهة المتجر المباشرة على الإنترنت فارغة تماماً من أي منتجات معروضة (404 لصفحات المنتجات)، لأن قاعدة بيانات Supabase الحية غير مزودة ببيانات البذور (Seed Data). | تشغيل سكربت إدخال بيانات المنتجات الحقيقية على مشروع Supabase الإنتاجي وتعيين حالاتها كـ `is_active = true`. | S | لا (بيانات خارجية) |
| **F-03** | **MEDIUM** | قاعدة البيانات (CRM) | `supabase/migrations/0002_production_hardening.sql:226-228` و `src/lib/data/demo/index.ts:293-295` | `on conflict (phone) do update set name = excluded.name` | تجاوز اسم العميل المسجل في الـ CRM عند قيام شخص آخر بالطلب من نفس رقم الهاتف (مثل أفراد العائلة أو خطأ إملائي)، مما يفقد المتجر الاسم الأصلي الموثوق. | استخدام شرط عدم الاستبدال إذا كان الاسم مسجلاً مسبقاً، أو حفظ الاسم في سجل الطلب مع تحديث حقل ملاحظات العميل بدلاً من طمس اسمه الأصلي. | S | **نعم (مسار R9 حساس)** |
| **F-04** | **MEDIUM** | جودة الاختبارات (Testing) | `tests/place-order.integration.test.ts:1-5` | `Integration: checkout server action against the demo data layer` | جميع الاختبارات الـ 69 في Vitest تعمل حصرياً ضد محاكي الذاكرة (Demo Adapter)، ولا يوجد اختبار آلي يغطي تكامل دوال PostgreSQL وقواعد الـ RLS الفعلية. | إضافة بيئة اختبار تكاملي تستهدف قاعدة بيانات محلية (Test Postgres Container) للتأكد من توافق دوال SQL الحقيقية. | M | لا |
| **F-05** | **MEDIUM** | دوال SQL (Database) | `supabase/migrations/0005_expire_unconfirmed_orders.sql:42-44` | `if v_day not in (1, 2, 3, 4, 6) or extract(minute from v_local_now)::integer <> 0` | كود غير مستخدم (Dead Code): دالة `expire_unconfirmed_orders` تستثني يوم الأحد (ISO DOW 7) وتفشل عند وجود أي تأخير في دقائق الـ Cron، كما أنها غير مستدعاة من أي مسار برمجي في التطبيق (مسار `/api/cron/keepalive` ينفذ الإلغاء عبر كود TypeScript الخاص به). | إما حذف الدالة المهملة لتقليل التشويش في الترحيلات أو تصحيح نطاق الأيام إلى `(1, 2, 3, 4, 6, 7)` وجعل الـ Cron يستدعيها مباشرة. | S | **نعم (مسار R9 حساس)** |
| **F-06** | **LOW** | مشاركة الروابط (SEO/Social) | `src/app/layout.tsx:58-59` | `const ogImagePath = join(process.cwd(), "public", "og-image.png"); const hasOgImage = existsSync(ogImagePath);` | ملف `public/og-image.png` غير موجود، وبالتالي يتم حذف وسم `og:image` وبطاقة `twitter:card` من ترويسة HTML للموقع، فتظهر الروابط بدون صورة معاينة عند مشاركتها على واتساب أو منصات التواصل. | توفير صورة معاينة عالية الجودة بأبعاد 1200x630 في مسار `public/og-image.png`. | S | لا |
| **F-07** | **LOW** | صفحات الأخطاء (UX) | `src/app/(store)/not-found.tsx` و `error.tsx` | غياب `src/app/not-found.tsx` و `src/app/error.tsx` على المستوى الجذري | في حال حدوث خطأ 404 أو 500 خارج مجموعة `(store)` (مثل مسارات `/admin/*` أو المسارات غير المعروفة في الجذر)، يظهر قالب الخطأ الافتراضي الخام لـ Next.js بدلاً من الواجهة المصممة للمتجر. | نقل أو تكرار `not-found.tsx` و `error.tsx` إلى الجذر `src/app/` مع دعم واجهة المشرف. | S | لا |
| **F-08** | **NIT** | كود مهمل (Dead Code) | `src/features/home/components/` و `src/features/catalog/components/` | وجود مكونات غير مستخدمة: `BannerSlider`, `HeroSection`, `Atelier*`, `Skeleton` | بقايا مكونات من تصاميم سابقة قبل الانتقال للتصميم التحريري (Editorial) تزيد من حجم الكود المصدري دون فائدة تشغيلية. | تنظيف المكونات اليتيمة غير المستدعاة من شجرة الكود. | S | لا |
| **F-09** | **NIT** | أمان الترويسات (Security) | `next.config.mjs:18-27` | غياب ترويسة `Content-Security-Policy` (CSP) | المتجر يمتلك 5 ترويسات أمان قوية (HSTS, X-Frame-Options, X-Content-Type, Referrer, Permissions) لكنه يفتقر لترويسة CSP لحظر تحميل سكربتات غير مصرح بها. | إضافة ترويسة CSP صارمة تناسب استضافة Vercel وخطوط Google الذاتية. | M | **نعم (مسار R9 حساس)** |

---

## 4. جدول المشتبهات المعروفة (Known Suspects S1–S15)

| الرمز | المشتبه به | الحالة الميدانية | الدليل البرمجي والتحقق المباشر |
| :---: | :--- | :---: | :--- |
| **S1** | استخدام مسارات الإدارة (files, upload, reports) لـ `getSession` بدلاً من `getActiveSession` | **FIXED** | تم فحص الملفات الثلاثة، وجميعها تستخدم `getActiveSession()` للتحقق من المشرف وصلاحياته: `files/route.ts:8`، `reports/export/route.ts:7`، `api/admin/upload/route.ts:14`. |
| **S2** | قيام `requireAdmin` بحذف ملفات تعريف الارتباط أثناء الرندر (`destroySession`) | **FIXED** | تم التحقق من `src/features/auth/session.ts:90-95`. الدالة تستدعي `redirect("/admin/login")` فقط ولا تحذف الكوكيز في Server Components لتجنب خطأ Next.js الشهير. |
| **S3** | استدعاء `window.open(...)` بعد عملية `await` في `CheckoutForm` (حظر النوافذ في الهواتف) | **FIXED** | تم فحص `src/features/checkout/components/CheckoutForm.tsx:92`. التطبيق يستدعي `router.push(res.data.successUrl)` للانتقال إلى صفحة التأكيد، حيث يوجد رابط HTML مباشر لتطبيق واتساب لا يتعرض للحظر إطلاقاً. |
| **S4** | طول رابط واتساب `wa.me` لسلة بها 1، 3، و 8 منتجات | **FIXED** | أظهر الفحص الميداني عبر سكربت تشغيلي أن الرابط يرسل ملخصاً موجزاً ورقم الطلب فقط (#ZM-XXXX):<br>• سلة 1 منتج: 898 حرفاً<br>• سلة 3 منتجات: 899 حرفاً<br>• سلة 8 منتجات: 900 حرفاً<br>جميعها أقل بكثير من حاجز الخطر (2000 حرف). |
| **S5** | غياب بديل Safari/iOS عند فشل `canvas.toBlob("image/webp")` في رافع الصور | **FIXED** | تم التحقق من `src/features/uploads/client.ts:156-170`. في حال فشل المتصفح في توليد WebP، يتم فوراً الرجوع إلى `canvas.toBlob(..., "image/jpeg", quality)` مع تعديل اللاحقة تلقائياً. |
| **S6** | معالجة محارف `<` في JSON-LD لصفحات المنتجات لمنع XSS | **FIXED** | في `src/lib/json-ld.ts:10` و `src/app/(store)/product/[slug]/page.tsx:70`، يتم تمرير البيانات عبر `serializeJsonLd` التي تستبدل `<` بـ `\u003c` و `>` بـ `\u003e`. |
| **S7** | استخدام أنماط شاملة للصور (`remotePatterns`) والسماح بـ `placehold.co` في الإنتاج | **STILL PRESENT** | في `next.config.mjs:10-15`، النطاقات محصورة بـ Supabase و `placehold.co`، لكن `placehold.co` ما زال مسموحاً في بيئة الإنتاج وترويسة CSP غير موجودة. |
| **S8** | تحديد سقف الطلبات غير المؤكدة لكل هاتف وإلغاؤها التلقائي | **FIXED** | تم التحقق في `checkout/server/actions.ts:40-43` (حد أقصى طلبان لكل هاتف)، وفي `api/cron/keepalive/route.ts:19-25` (إلغاء تلقائي للطلبات غير المؤكدة بعد مرور 24 ساعة). |
| **S9** | وجود مسار عمل CI وتشغيل الفحص واختبارات الأنواع | **FIXED** | تم التحقق من وجود `.github/workflows/ci.yml` وهو ينفذ `npm run typecheck` و `npm run lint` و `npm test` على جميع الـ Pull Requests والـ Push لفرع `main`. |
| **S10** | حد رفع إشعارات العملاء (4 MB) مقارنة بحجم صور الهواتف الكبيرة | **FIXED** | العميل يدعم صوراً أصلية تصل حتى 15 ميجابايت (`src/features/uploads/client.ts:6`) ويقوم بضغطها وتصغيرها في المتصفح قبل الإرسال لتصبح أقل من 1.5 ميجابايت، متوافقة تماماً مع حد الخادم 4 ميجابايت. |
| **S11** | توفر وسم `og:image` وبطاقة Twitter Card في الموقع | **STILL PRESENT** | ملف `public/og-image.png` مفقود من شجرة الملفات، مما يجعل كود `src/app/layout.tsx:85` يحذف وسوم المعاينة بالكامل. |
| **S12** | فراغ الكتالوج من المنتجات على الموقع الحي | **STILL PRESENT** | أكد الفحص الميداني الحي (`phase10-smoke.js`) وجود 0 منتجات في الصفحة الرئيسية وصفحة التصنيفات على الرابط المباشر. |
| **S13** | أرقام الطلبات المتسلسلة (`ZM-1001...`) وخطر استكشاف بيانات الزبائن | **FIXED** | تم التحقق: صفحة إتمام الطلب `/order/[number]` محمية برمز توقيع مشفر HMAC (`?t=...`)، وصفحة التتبع `/track` تشترط تطابق رقم الطلب مع رقم الجوال مع تقييد صارم للمحاولات (Rate Limited). |
| **S14** | استبدال اسم الزبون عند تكرار نفس رقم الهاتف في الـ CRM | **STILL PRESENT** | في ترحيل SQL رقم `0002_production_hardening.sql:227` ومحاكي الذاكرة، يتم استخدام `set name = excluded.name` مما يطمس اسم الزبون المسجل إذا أُدخل اسم مختلف لنفس الرقم. |
| **S15** | وجود ادعاءات في `PR_DESCRIPTION.md` غير مدعومة في الكود المصدري | **STILL PRESENT** | وثيقة الـ PR تدعي أن الشعار هو "Vector SVG مضمن"، بينما الكود الفعلي في `Logo.tsx` يستخدم `<Image src="/logo.webp">`، وتذكر أن كود JSON-LD أُضيف في `src/app/(store)/page.tsx` بينما هو فعلياً في `src/app/(editorial)/page.tsx`. |

---

## 5. جدول مطابقة الادعاءات (Claims Inventory C1–C29)

| الادعاء | المصدر | الحالة | الدليل والتحقق البرمجي |
| :--- | :--- | :---: | :--- |
| **C1**: البنية مبنية على Next.js 16 App Router و TypeScript و Tailwind 3 | README.md | **VERIFIED** | `package.json: next@16.4.3, tailwindcss@^3.4.17, typescript@^5` |
| **C2**: تشغيل محلي بدون Supabase يعمل في وضع الـ Demo | README.md | **VERIFIED** | `src/lib/env.ts: isDemo` يستبدل مزود البيانات تلقائياً بمحاكي الذاكرة. |
| **C3**: بيئات الاستضافة المباشرة تمنع استخدام وضع الـ Demo قطعياً | ARCHITECTURE.md | **VERIFIED** | `src/lib/server-env.ts:44-46` يرمي استثناءً صريحاً يوقف التشغيل إن لم تتوفر إعدادات Supabase في Vercel. |
| **C4**: الطلب يتم في الموقع ويتم تأكيده عبر واتساب | README.md | **VERIFIED** | مسار `checkout/server/actions.ts` يحفظ الطلب ويولد رابط واتساب للتأكيد. |
| **C5**: تجاوز حظر النوافذ المنبثقة على الهواتف | PR_DESCRIPTION.md | **VERIFIED** | استخدام `router.push` ثم رابط HTML تقليدي برقم الطلب. |
| **C6**: الشعار عبارة عن Vector SVG مضمن | PR_DESCRIPTION.md | **FALSE** | `src/components/layout/Logo.tsx:12` يستدعي `<Image src="/logo.webp">`. |
| **C7**: جميع إجراءات ومسارات الإدارة محمية بالجلسة | ARCHITECTURE.md | **VERIFIED** | تم فحص جميع Server Actions ومسارات Route Handlers ووجد أنها محمية بـ `requireAdmin` أو `getActiveSession`. |
| **C8**: نجاح جميع الاختبارات الآلية | PR_DESCRIPTION.md | **VERIFIED** | `npm test`: 69/69 اختباراً ناجحاً بنسبة 100%. |
| **C9**: إعادة التسعير في الخادم تتجاهل تماماً أسعار المتصفح | ARCHITECTURE.md | **VERIFIED** | `src/features/checkout/lib/build-order.ts:42-69` يعيد قراءة أسعار السلع والإضافات من قاعدة البيانات. |
| **C10**: حماية المخزون من الاسترجاع الوهمي المتكرر للطلبات الملغية | PR_DESCRIPTION.md | **VERIFIED** | تم فحص ترحيل `0004_crm_order_sync.sql:35` ومحاكي الذاكرة: التحقق من `v_old_status = 'cancelled'`. |
| **C11**: ظهور كتلة التنبيه الصفراء لتأكيد الواتساب في صفحة النجاح | PR_DESCRIPTION.md | **VERIFIED** | `src/app/(store)/order/[number]/page.tsx:38-47`. |
| **C12**: تقييد الطلبات برقم الهاتف إلى طلبين كحد أقصى لكل 10 دقائق | PR_DESCRIPTION.md | **VERIFIED** | `src/features/checkout/server/actions.ts:48`. |
| **C13**: إلغاء فوري لجلسة المشرف المعطل في قاعدة البيانات | PR_DESCRIPTION.md | **FALSE** | الجلسات الحالية تستخدم `authProvider: "standalone"` وتتجاوز استعلام جدول `admin_users` تماماً (`session.ts:66-69`). |
| **C14**: تجاوب كامل على عرض 375px بدون أي تمرير أفقي | PR_DESCRIPTION.md | **VERIFIED** | `overflow-x: hidden` في `globals.css` وحشوات مرنة في الحاوية. |
| **C15**: احترام إعداد تقليل الحركة في النظام `prefers-reduced-motion` | PR_DESCRIPTION.md | **VERIFIED** | `src/app/globals.css:172-181` يوقف الانتقالات والحركات تلقائياً. |
| **C16**: شريط خطوات الدفع عبارة عن `<ol>` غير تفاعلي بمؤشرات مرئية | PR_DESCRIPTION.md | **VERIFIED** | `src/features/checkout/components/CheckoutSteps.tsx`. |
| **C17**: بيانات `LocalBusiness` المنظمة JSON-LD في الصفحة الرئيسية | PR_DESCRIPTION.md | **VERIFIED** | مضافة في `src/app/(editorial)/page.tsx:63-80` مع تفاصيل العنوان ورقم الواتساب. |
| **C18**: تشفير محارف `<` في كود JSON-LD | PR_DESCRIPTION.md | **VERIFIED** | `src/lib/json-ld.ts:10` باستخدام استبدال `\u003c`. |
| **C19**: بيانات وصفية فريدة وروابط كانونيكال لصفحات المتجر الأساسية | PR_DESCRIPTION.md | **VERIFIED** | موجودة في `/categories`, `/occasions`, `/offers`, `/contact`, `/track`. |
| **C20**: إنشاء صفحة سياسة الخصوصية والتوصيل `/policy` | PR_DESCRIPTION.md | **VERIFIED** | `src/app/(store)/policy/page.tsx` تغطي الخصوصية، التوصيل في غزة، والاسترجاع. |
| **C21**: ربط صفحة السياسة في تذييل الموقع | PR_DESCRIPTION.md | **VERIFIED** | `src/components/layout/Footer.tsx:40`. |
| **C22**: سقف خادم الرفع هو 4 ميجابايت | PR_DESCRIPTION.md | **VERIFIED** | `src/app/api/upload/route.ts:7` و `src/app/api/admin/upload/route.ts:10`. |
| **C23**: ضغط صور الهواتف حتى 15 ميجابايت على جهاز العميل | PR_DESCRIPTION.md | **VERIFIED** | `src/features/uploads/client.ts:6, 28`. |
| **C24**: تحويل الصور إلى WebP مع بديل JPEG لـ Safari | PR_DESCRIPTION.md | **VERIFIED** | `src/features/uploads/client.ts:156-170`. |
| **C25**: توفر وسوم OpenGraph و Twitter Cards لشبكات التواصل | PR_DESCRIPTION.md | **FALSE** | `public/og-image.png` مفقود مما يؤدي لتعطيل إدراجها في الصفحة. |
| **C26**: مهمة Cron للحفاظ على نشاط مشروع Supabase المجاني | ARCHITECTURE.md | **VERIFIED** | مجدولة في `vercel.json` يومياً على مسار `/api/cron/keepalive`. |
| **C27**: تحديد سقف الطلبات غير المؤكدة للزبون بواقع طلبين | ARCHITECTURE.md | **VERIFIED** | `src/features/checkout/lib/unconfirmed-order-limit.ts`. |
| **C28**: إلغاء تلقائي للطلبات غير المؤكدة بعد 24 ساعة | ARCHITECTURE.md | **VERIFIED** | `src/app/api/cron/keepalive/route.ts:19-25`. |
| **C29**: توليد أرقام طلبات بتنسيق ZM-1001 تصاعدياً | ARCHITECTURE.md | **VERIFIED** | متسلسلة `order_number_seq` في `0001_init.sql` و `pricing.ts`. |

---

## 6. قائمة المهام غير المنفذة أو المحظورة (NOT RUN / BLOCKED)

1. **فحص قاعدة البيانات المؤقتة عبر سطر الأوامر (Phase 5.2):** `NOT RUN`
   - **السبب:** لا تتوفر أدوات `docker` أو عميل `psql` في بيئة موجه أوامر النظام المحلي، والالتزام بالقاعدة الصارمة **R4** يمنع تشغيل أي أوامر SQL عشوائية أو ترحيلات مباشرة على قاعدة بيانات Supabase الحية.
2. **إجراء طلب تجريبي حقيقي أو تقديم نماذج على الموقع الحي (Phase 10):** `NOT RUN`
   - **السبب:** الامتثال الصارم للقاعدة **R4** بحظر إرسال أي طلبات أو نماذج وهمية أو كتابة أي بيانات على بيئة الإنتاج المباشرة. تم الاكتفاء بطلبات القراءة (`GET` و `HEAD`) وفحص الاستجابات وحالة الكتالوج.

---

## 7. نقاط القوة الهندسية في المشروع (What is Genuinely Good)

1. **إعادة التسعير الصارمة في جانب الخادم (Server Re-Pricing):**
   الدالة `buildOrder` في `src/features/checkout/lib/build-order.ts` تتجاهل تماماً أي أسعار أو مجاميع قادمة من العميل، وتعيد حساب أسعار المنتجات وخياراتها والتوصيل والكوبونات مباشرة من السجلات الموثوقة.
2. **اتساق كامل في الأنواع وغياب تام لأخطاء الهروب من الفحص:**
   شجرة الكود بالكامل (164 ملفاً في `src/`) تخلو تماماً من استخدام `any`، وتخلو من `@ts-ignore` أو `@ts-expect-error`، مع استثناء تعليق واحد فقط مبرر لـ `eslint-disable` لتنزيل ملف CSV في لوحة الإدارة.
3. **حماية مسار رسائل الواتساب من اقتطاع الروابط (Zero URL Overflow):**
   تصميم رسالة الواتساب `orderWhatsappMessage` تم بهندسة ذكية بالاعتماد على إرسال مرجع الطلب المختصر (#ZM-XXXX) ورابط التتبع بدلاً من تفريغ كافة المنتجات، مما ثبّت طول الرابط عند ~900 حرف حتى مع وجود 8 منتجات فاخرة ذات خيارات متعددة.
4. **منع هجمات الاستكشاف وتسريب البيانات (No IDOR / Enumeration):**
   على الرغم من أن أرقام الطلبات متسلسلة (`ZM-1001`)، إلا أن صفحة التأكيد تتطلب رمزاً موقعاً برمز أمان خفي HMAC (`?t=...`)، وصفحة التتبع تتطلب إدخال رقم الطلب ورقم الهاتف معاً مع تقييد محاولات التخمين بمحدد سرعة (Rate Limit).
5. **ضغط متقدم للصور في المتصفح قبل الرفع:**
   توفير خط أنابيب كامل في `src/features/uploads/client.ts` يدعم صور الهواتف الذكية حتى 15 ميجابايت وصيغ HEIC/HEIF ويضغطها في جهاز العميل عبر Canvas مع دعم احتياطي مباشر لـ JPEG لأجهزة iOS القديمة، مما يحمي الخادم من قيود الحجم واستهلاك الباندويث.
6. **احترام شامل لإمكانية الوصول وتجربة المستخدم العربي (RTL & A11y):**
   توفر خطوط عربية مستضافة ذاتياً (Cairo, Reem Kufi, Amiri) بأداء فائق، تكبير خط الحقول إلى 16px تلقائياً على الهواتف لمنع زووم Safari المزعج، أهداف لمس واسعة لا تقل عن 44x44px، ورابط تخطي سريع للمحتوى `Skip to content`.

