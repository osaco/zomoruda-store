"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRepos } from "@/lib/data";
import { ORDER_STATUS_VALUES } from "@/types/enums";
import { requireAdmin } from "@/features/auth/session";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUS_VALUES),
  note: z.string().trim().max(300).optional(),
});

export async function updateOrderStatus(form: FormData) {
  const session = await requireAdmin();
  const parsed = schema.safeParse({ id: form.get("id"), status: form.get("status"), note: form.get("note") || undefined });
  if (!parsed.success) return;
  const repos = getRepos();
  const updated = await repos.orders.updateStatus(parsed.data.id, parsed.data.status, parsed.data.note ?? null, session.email);
  if (!updated) return;
  revalidatePath("/admin", "layout");
}
