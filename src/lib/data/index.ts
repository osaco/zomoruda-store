import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import type { Repositories } from "./repositories";
import { createDemoRepositories } from "./demo";
import { createSupabaseRepositories } from "./supabase";

let repos: Repositories | null = null;

/** Single entry point to the data layer. Picks Supabase when configured, demo otherwise. */
export function getRepos(): Repositories {
  const hosted = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
  if (hosted && !isSupabaseConfigured) {
    throw new Error("Supabase credentials are required in Vercel Production and Preview; demo data is disabled there.");
  }
  repos ??= isSupabaseConfigured ? createSupabaseRepositories() : createDemoRepositories();
  return repos;
}

export type * from "./repositories";
