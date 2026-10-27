import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import type { Repositories } from "./repositories";
import { createDemoRepositories } from "./demo";
import { createSupabaseRepositories } from "./supabase";

let repos: Repositories | null = null;

/** Single entry point to the data layer. Picks Supabase when configured, demo otherwise. */
export function getRepos(): Repositories {
  repos ??= isSupabaseConfigured ? createSupabaseRepositories() : createDemoRepositories();
  return repos;
}

export type * from "./repositories";
