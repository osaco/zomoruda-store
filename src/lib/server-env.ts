import "server-only";
import { z } from "zod";

const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
// Preview deployments are public too; never fall back to predictable secrets there.
const isHostedDeployment = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";

export const serverEnv = z
  .object({
    ADMIN_DEMO_PASSWORD: z.preprocess(
      blank,
      isHostedDeployment
        ? z.string().min(8, "\u064A\u062C\u0628 \u062A\u0639\u064A\u064A\u0646 ADMIN_DEMO_PASSWORD \u0641\u064A \u0628\u064A\u0626\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C")
        : z.string().min(6).default("zomoruda2026"),
    ),
    AUTH_SECRET: z.preprocess(
      blank,
      isHostedDeployment
        ? z.string().min(32, "\u064A\u062C\u0628 \u062A\u0639\u064A\u064A\u0646 AUTH_SECRET \u0628\u0637\u0648\u0644 32 \u062D\u0631\u0641\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0641\u064A \u0628\u064A\u0626\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C")
        : z.string().min(16).default("dev-only-secret-change-me-please"),
    ),
    CRON_SECRET: z.preprocess(blank, z.string().optional()),
  })
  .parse({
    ADMIN_DEMO_PASSWORD: process.env.ADMIN_DEMO_PASSWORD,
    AUTH_SECRET: process.env.AUTH_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
  });
