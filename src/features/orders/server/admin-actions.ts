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
  const before = await repos.orders.getById(parsed.data.id);
  if (!before || before.status === parsed.data.status) return;
  await repos.orders.updateStatus(parsed.data.id, parsed.data.status, parsed.data.note ?? null, session.email);
  if (before.status !== "cancelled" && parsed.data.status === "cancelled") {
    await Promise.all(before.items.map((i) => repos.products.adjustStock(i.productId, i.quantity)));
  } else if (before.status === "cancelled" && parsed.data.status !== "cancelled") {
    await Promise.all(before.items.map((i) => repos.products.adjustStock(i.productId, -i.quantity)));
  }
  revalidatePath("/admin", "layout");
}
