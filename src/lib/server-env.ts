import "server-only";
import { z } from "zod";

const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

/** Server-only secrets. Never import from client components. */
export const serverEnv = z
  .object({
    ADMIN_DEMO_PASSWORD: z.preprocess(blank, z.string().min(6).default("zomoruda2026")),
    AUTH_SECRET: z.preprocess(blank, z.string().min(16).default("dev-only-secret-change-me-please")),
    CRON_SECRET: z.preprocess(blank, z.string().optional()),
  })
  .parse({
    ADMIN_DEMO_PASSWORD: process.env.ADMIN_DEMO_PASSWORD,
    AUTH_SECRET: process.env.AUTH_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
  });
