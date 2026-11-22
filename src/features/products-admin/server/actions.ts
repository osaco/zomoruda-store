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
  const input = parsed.data;
  try {
    if (id) {
      const product = await repos.products.getById(id);
      if (!product) return { error: "المنتج غير موجود" };
      await repos.products.update(id, { ...input, slug: product.slug });
    } else {
      const base = input.slug || "gift";
      const slug = await repos.products.getBySlug(base) ? `${base}-${crypto.randomUUID().slice(0, 8)}` : base;
      await repos.products.create({ ...input, slug });
    }
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
