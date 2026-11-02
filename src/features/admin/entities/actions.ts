"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepos } from "@/lib/data";
import type { CrudRepository } from "@/lib/data/repositories";
import { requireAdmin } from "@/features/auth/session";
import { ENTITIES, isEntityName } from "./config";

export type EntityFormState = { error?: string };

function repoFor(entity: string) {
  if (!isEntityName(entity)) throw new Error("Unknown entity");
  return getRepos()[ENTITIES[entity].repo] as unknown as CrudRepository<{ id: string }>;
}

export async function saveEntity(_: EntityFormState, form: FormData): Promise<EntityFormState> {
  await requireAdmin("admin");
  const entity = String(form.get("_entity"));
  if (!isEntityName(entity)) return { error: "غير معروف" };
  const config = ENTITIES[entity];
  const raw = Object.fromEntries(config.fields.map((f) => [f.name, form.get(f.name) ?? undefined]));
  const parsed = config.schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const label = config.fields.find((f) => f.name === issue?.path[0])?.label;
    return { error: `${label ? `${label}: ` : ""}${issue?.message ?? "بيانات غير صحيحة"}` };
  }
  const id = String(form.get("_id") ?? "");
  try {
    const repo = repoFor(entity);
    if (id) await repo.update(id, parsed.data);
    else await repo.create(parsed.data as never);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "تعذّر الحفظ" };
  }
  revalidatePath("/", "layout");
  redirect(`/admin/${entity}`);
}

export async function deleteEntity(form: FormData) {
  await requireAdmin("admin");
  const entity = String(form.get("_entity"));
  let failed = false;
  try {
    await repoFor(entity).remove(String(form.get("_id")));
  } catch {
    failed = true; // e.g. a category that still has products
  }
  revalidatePath("/", "layout");
  redirect(`/admin/${entity}${failed ? "?error=delete" : ""}`);
}
