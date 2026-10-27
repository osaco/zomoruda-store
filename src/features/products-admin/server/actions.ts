"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepos } from "@/lib/data";
import { requireAdmin } from "@/features/auth/session";
import { toProductInput } from "../lib/parse";

export type ProductFormState = { error?: string };

export async function saveProduct(_: ProductFormState, form: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = toProductInput(form);
  if (!parsed.ok) return { error: parsed.error };
  const id = String(form.get("id") ?? "");
  const repos = getRepos();
  const clash = await repos.products.getBySlug(parsed.data.slug);
  if (clash && clash.id !== id) return { error: "الرابط (slug) مستخدم لمنتج آخر" };
  try {
    if (id) await repos.products.update(id, parsed.data);
    else await repos.products.create(parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "تعذّر الحفظ" };
  }
  revalidatePath("/", "layout");
  redirect("/admin/products?saved=1");
}

export async function deleteProduct(form: FormData) {
  await requireAdmin("admin");
  await getRepos().products.remove(String(form.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/products");
}
