/** Known keys of the settings table (key/value). */
export const SETTING_KEYS = {
  ordersPaused: "orders_paused",
  ordersPausedMessage: "orders_paused_message",
  bankDetails: "bank_details",
  announcement: "announcement",
  orderWhatsappNumber: "order_whatsapp_number",
  contactInstagram: "contact_instagram",
  contactAddress: "contact_address",
  contactHours: "contact_hours",
  contactMapUrl: "contact_map_url",
} as const;

export type StoreSettings = {
  ordersPaused: boolean;
  ordersPausedMessage: string;
  bankDetails: string;
  announcement: string;
  orderWhatsappNumber: string;
  contactInstagram: string;
  contactAddress: string;
  contactHours: string;
  contactMapUrl: string;
};
