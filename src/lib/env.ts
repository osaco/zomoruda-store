import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional(),
);

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("http://localhost:3000"),
  ),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.preprocess(
    emptyToUndefined,
    z.string().min(6).default("970567812644"),
  ),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
});

if (!parsed.success) {
  throw new Error(
    `فشل التحقق من البيئة: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
  );
}

export const env = parsed.data;

export const isSupabaseConfigured = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    (typeof window !== "undefined" || env.SUPABASE_SERVICE_ROLE_KEY),
);

export const isDemo = !isSupabaseConfigured;

export type AppEnv = typeof env;;

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional(),
);

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("http://localhost:3000"),
  ),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.preprocess(
    emptyToUndefined,
    z.string().min(6).default("970567812644"),
  ),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
});

if (!parsed.success) {
  throw new Error(
    `متغيرات البيئة غير صحيحة: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
  );
}

export const env = parsed.data;

export const isSupabaseConfigured = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    env(typeof window !== "undefined" || .SUPABASE_SERVICE_ROLE_KEY,
);

export const isDemo = !isSupabaseConfigured;

export type AppEnv = typeof env;
