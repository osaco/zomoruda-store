"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRepos } from "@/lib/data";
import { requireAdmin } from "@/features/auth/session";
import { SETTING_KEYS } from "../keys";

export async function saveSettings(form: FormData) {
  await requireAdmin("admin");
  const digits = String(form.get("orderWhatsappNumber") ?? "").trim().replace(/[ ()-]/g, "").replace(/^\+|^00/, "");
  if (!/^[1-9]\d{6,14}$/.test(digits)) redirect("/admin/settings?whatsapp=invalid");
  const instagram = String(form.get("contactInstagram") ?? "").trim().replace(/^@/, "");
  const map = String(form.get("contactMapUrl") ?? "").trim();
  if ((instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) ||
      (map && (map.length > 500 || URL.parse(map)?.protocol !== "https:"))) {
    redirect("/admin/settings?contact=invalid#contact");
  }
  const repo = getRepos().settings;
  await Promise.all([
    repo.set(SETTING_KEYS.contactInstagram, instagram),
    repo.set(SETTING_KEYS.contactAddress, String(form.get("contactAddress") ?? "").trim().slice(0, 180)),
    repo.set(SETTING_KEYS.contactHours, String(form.get("contactHours") ?? "").trim().slice(0, 180)),
    repo.set(SETTING_KEYS.contactMapUrl, map),
    repo.set(SETTING_KEYS.orderWhatsappNumber, digits),
    repo.set(SETTING_KEYS.ordersPaused, form.get("ordersPaused") === "on" ? "true" : "false"),
    repo.set(SETTING_KEYS.ordersPausedMessage, String(form.get("ordersPausedMessage") ?? "").slice(0, 300)),
    repo.set(SETTING_KEYS.announcement, String(form.get("announcement") ?? "").slice(0, 200)),
    repo.set(SETTING_KEYS.bankDetails, String(form.get("bankDetails") ?? "").slice(0, 500)),
  ]);
  revalidatePath("/", "layout");
  redirect("/admin/settings?whatsapp=saved");
}
