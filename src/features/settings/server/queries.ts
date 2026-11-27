import "server-only";
import { cache } from "react";
import { site } from "@/lib/site";
import { getRepos } from "@/lib/data";
import { SETTING_KEYS, type StoreSettings } from "../keys";

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  const all = new Map((await getRepos().settings.all()).map((s) => [s.key, s.value]));
  return {
    ordersPaused: all.get(SETTING_KEYS.ordersPaused) === "true",
    ordersPausedMessage: all.get(SETTING_KEYS.ordersPausedMessage) ?? "استقبال الطلبات متوقف مؤقتاً.",
    bankDetails: all.get(SETTING_KEYS.bankDetails) ?? "",
    contactInstagram: all.get(SETTING_KEYS.contactInstagram) || site.instagram,
    contactAddress: all.get(SETTING_KEYS.contactAddress) || site.addressAr,
    contactHours: all.get(SETTING_KEYS.contactHours) || site.hoursAr,
    contactMapUrl: all.get(SETTING_KEYS.contactMapUrl) || site.mapUrl,
    orderWhatsappNumber: all.get(SETTING_KEYS.orderWhatsappNumber) || site.whatsapp,
    announcement: all.get(SETTING_KEYS.announcement) ?? "",
  };
});
