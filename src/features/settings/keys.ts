/** Known keys of the settings table (key/value). */
export const SETTING_KEYS = {
  ordersPaused: "orders_paused",
  ordersPausedMessage: "orders_paused_message",
  bankDetails: "bank_details",
  announcement: "announcement",
} as const;

export type StoreSettings = {
  ordersPaused: boolean;
  ordersPausedMessage: string;
  bankDetails: string;
  announcement: string;
};
