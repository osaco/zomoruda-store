"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRepos } from "@/lib/data";
import { requireAdmin } from "@/features/auth/session";

const date = z.preprocess((v) => (v === "" ? null : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable());
const schema = z.object({ id: z.string(), name: z.string().trim().min(2), notes: z.string().trim().max(1000), birthday: date, anniversary: date });

export async function updateCustomer(form: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return;
  const { id, ...rest } = parsed.data;
  await getRepos().customers.update(id, rest);
  revalidatePath(`/admin/customers/${id}`);
}
