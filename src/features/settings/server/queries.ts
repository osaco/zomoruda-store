import "server-only";
import { cache } from "react";
import { getRepos } from "@/lib/data";
import { SETTING_KEYS, type StoreSettings } from "../keys";

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  const all = new Map((await getRepos().settings.all()).map((s) => [s.key, s.value]));
  return {
    ordersPaused: all.get(SETTING_KEYS.ordersPaused) === "true",
    ordersPausedMessage: all.get(SETTING_KEYS.ordersPausedMessage) ?? "استقبال الطلبات متوقف مؤقتاً.",
    bankDetails: all.get(SETTING_KEYS.bankDetails) ?? "",
    announcement: all.get(SETTING_KEYS.announcement) ?? "",
  };
});
