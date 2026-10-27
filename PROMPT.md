Build, from this empty repo, a complete production-ready Arabic (RTL) e-commerce store for "زُمُرّدة | Zomoruda", a gift shop in Gaza (Al-Rimal, Palmyra junction). Follow AGENTS.md and the skills in .opencode/skill. Work in small verifiable steps, commit after each phase, and write a README (setup, Supabase, Vercel deploy).

1. BUSINESS
- Sells gift boxes, flowers, perfumes, cosmetics, mugs, accessories (necklaces, bracelets, earrings), bags, wedding fingerprint frames and wedding giveaways.
- Customers come from Instagram (84k followers), mostly mobile, slow internet.
- No card payments: cash on delivery or bank/wallet transfer with receipt photo. Orders confirmed on WhatsApp +970567812644. Replaces their Google Form.

2. STACK: Next.js App Router, TypeScript, Tailwind, Supabase (Postgres + Storage + Auth, RLS), Vercel (with daily keepalive cron), zod, zustand, lucide-react, recharts, vitest.

3. DATA MODEL (Supabase SQL migrations + seed)
categories, occasions (عيد ميلاد، تخرج، عرس، عيد الأم، مولود جديد), products (name_ar, slug, description_ar, price, compare_at_price, category_id, stock_qty, availability, is_featured, is_new, is_active, allow_name, allow_card_message, allow_photo_upload), product_images, product_occasions, product_options (name_ar, values jsonb with price delta), delivery_zones, coupons, customers (phone unique, birthday, anniversary, totals), orders (order_number ZM-xxxx, items jsonb snapshot, subtotal, delivery_fee, discount, total, fulfillment, delivery_date, time_slot, payment_method, receipt_path, status, notes), order_status_history, banners, settings (key/value), admin_users (role admin|staff).
Seed: all categories + occasions, 3 zones, 12 sample products with placeholder images.

4. STOREFRONT
Home (banner slider, category circles, الأكثر مبيعاً, وصل حديثاً, occasions chips, offers strip, Instagram/WhatsApp/map, footer with hours); category + occasion pages with filters/sort/pagination; instant search; product page (gallery with swipe+zoom, options updating price, customization fields: name, card message ≤150 chars, photo upload; add to cart; order directly on WhatsApp; related; share); cart drawer + page; single-page checkout (name, phone PS validation, zone fee, address, delivery/pickup, date + time slot, payment method, receipt upload, notes) -> server creates order -> WhatsApp handoff -> success page; order tracking (number + phone, status timeline); orders paused banner; floating WhatsApp; PWA (manifest, icons from logo, offline page).

5. ADMIN /admin — overview, orders, products, categories, occasions, banners, zones, coupons, customers CRM, reports + CSV, settings, roles (see admin-crm-dashboard skill).

6. DESIGN — follow arabic-rtl-design skill exactly (purple/lavender/gold, Reem Kufi + Tajawal, pill buttons, 20px cards, ribbon dividers). Logo at /public/logo.png with text fallback.

7. QUALITY — RTL everywhere, 360px mobile, Lighthouse 90+, lazy images + thumbnails, SEO + OG per product, AA accessibility, server-side price recompute, tests for pricing/coupons/order creation.

8. BUILD ORDER
1) setup + theme + layout  2) Supabase schema/seed  3) storefront catalog  4) cart/checkout/WhatsApp/tracking  5) admin auth + orders/products  6) CRM, coupons, zones, banners, reports, settings  7) PWA/SEO/perf/tests  8) README deploy guide.
After each phase, append to PROGRESS.md what was built and what the owner must provide.
