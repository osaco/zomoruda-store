---
name: nextjs-supabase
description: Stack conventions - Next.js App Router + TypeScript + Tailwind + Supabase (Postgres, Storage, Auth), deployed on Vercel.
---
# Stack
- Next.js App Router, TypeScript strict, Tailwind, server components by default; server actions / route handlers for mutations.
- Supabase: @supabase/ssr. Browser client uses NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY. Service role key ONLY in server code (lib/supabase/admin.ts), never imported in client components.
- Schema as SQL migrations in supabase/migrations/*.sql plus supabase/seed.sql. Enable RLS on every table: public read for active products/categories/occasions/banners/zones; orders insert only via server; admin tables only for authenticated admin_users.
- Storage buckets: product-images (public), receipts (private), customizations (private). Compress images client-side to WebP (max 1600px + 400px thumb) before upload (browser-image-compression).
- Admin auth: Supabase Auth email/password + admin_users table with role (admin | staff); middleware protects /admin.
- Env: .env.example lists all vars. Never commit secrets.
- Scripts: dev, build, lint, typecheck, test (vitest).
- Free-tier note: Supabase free pauses after 7 days idle; add a Vercel cron (/api/keepalive, daily) that does a trivial select.
- Commit after each phase with a clear message.
