/** Row (snake_case) <-> domain (camelCase) mapping for the Supabase adapter. */
import type {
  Banner,
  Category,
  Coupon,
  Customer,
  DeliveryZone,
  Occasion,
  Order,
  Product,
} from "@/types/db";

type Row = Record<string, unknown>;
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
const str = (v: unknown) => (v === null || v === undefined ? null : String(v));

export const toCategory = (r: Row): Category => ({
  id: String(r.id),
  nameAr: String(r.name_ar),
  slug: String(r.slug),
  descriptionAr: str(r.description_ar),
  imageUrl: str(r.image_url),
  sortOrder: Number(r.sort_order ?? 0),
  isActive: Boolean(r.is_active),
});
export const fromCategory = (c: Partial<Category>): Row => clean({
  name_ar: c.nameAr, slug: c.slug, description_ar: c.descriptionAr, image_url: c.imageUrl, sort_order: c.sortOrder, is_active: c.isActive,
});

export const toOccasion = (r: Row): Occasion => ({
  id: String(r.id),
  nameAr: String(r.name_ar),
  slug: String(r.slug),
  icon: str(r.icon),
  sortOrder: Number(r.sort_order ?? 0),
  isActive: Boolean(r.is_active),
});
export const fromOccasion = (o: Partial<Occasion>): Row => clean({
  name_ar: o.nameAr, slug: o.slug, icon: o.icon, sort_order: o.sortOrder, is_active: o.isActive,
});

export const toZone = (r: Row): DeliveryZone => ({
  id: String(r.id),
  nameAr: String(r.name_ar),
  fee: Number(r.fee),
  minOrder: num(r.min_order),
  deliveryTimeAr: String(r.delivery_time_ar ?? ""),
  sortOrder: Number(r.sort_order ?? 0),
  isActive: Boolean(r.is_active),
});
export const fromZone = (z: Partial<DeliveryZone>): Row => clean({
  name_ar: z.nameAr, fee: z.fee, min_order: z.minOrder, delivery_time_ar: z.deliveryTimeAr, sort_order: z.sortOrder, is_active: z.isActive,
});

export const toBanner = (r: Row): Banner => ({
  id: String(r.id),
  titleAr: String(r.title_ar),
  subtitleAr: str(r.subtitle_ar),
  imageUrl: String(r.image_url),
  linkUrl: str(r.link_url),
  sortOrder: Number(r.sort_order ?? 0),
  isActive: Boolean(r.is_active),
  startsAt: str(r.starts_at),
  endsAt: str(r.ends_at),
});
export const fromBanner = (b: Partial<Banner>): Row => clean({
  title_ar: b.titleAr, subtitle_ar: b.subtitleAr, image_url: b.imageUrl, link_url: b.linkUrl, sort_order: b.sortOrder, is_active: b.isActive, starts_at: b.startsAt, ends_at: b.endsAt,
});

export const toCoupon = (r: Row): Coupon => ({
  id: String(r.id),
  code: String(r.code),
  type: r.type as Coupon["type"],
  value: Number(r.value),
  minOrder: num(r.min_order),
  maxDiscount: num(r.max_discount),
  usageLimit: num(r.usage_limit),
  usedCount: Number(r.used_count ?? 0),
  startsAt: str(r.starts_at),
  endsAt: str(r.ends_at),
  isActive: Boolean(r.is_active),
});
export const fromCoupon = (c: Partial<Coupon>): Row => clean({
  code: c.code?.toUpperCase(), type: c.type, value: c.value, min_order: c.minOrder, max_discount: c.maxDiscount, usage_limit: c.usageLimit, used_count: c.usedCount, starts_at: c.startsAt, ends_at: c.endsAt, is_active: c.isActive,
});

export const toCustomer = (r: Row): Customer => ({
  id: String(r.id),
  name: String(r.name),
  phone: String(r.phone),
  birthday: str(r.birthday),
  anniversary: str(r.anniversary),
  ordersCount: Number(r.orders_count ?? 0),
  totalSpent: Number(r.total_spent ?? 0),
  notes: str(r.notes),
  createdAt: String(r.created_at),
});

export const PRODUCT_SELECT = "*, product_images(*), product_options(*), product_occasions(occasion_id)";

export const toProduct = (r: Row): Product => {
  const images = ((r.product_images as Row[]) ?? [])
    .map((i) => ({
      id: String(i.id),
      productId: String(i.product_id),
      url: String(i.url),
      altAr: str(i.alt_ar),
      sortOrder: Number(i.sort_order ?? 0),
      isPrimary: Boolean(i.is_primary),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const options = ((r.product_options as Row[]) ?? [])
    .map((o) => ({
      id: String(o.id),
      productId: String(o.product_id),
      nameAr: String(o.name_ar),
      isRequired: Boolean(o.is_required),
      sortOrder: Number(o.sort_order ?? 0),
      values: ((o.values as Row[]) ?? []).map((v) => ({
        valueAr: String(v.value_ar),
        priceDelta: Number(v.price_delta ?? 0),
      })),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: String(r.id),
    nameAr: String(r.name_ar),
    slug: String(r.slug),
    descriptionAr: String(r.description_ar ?? ""),
    price: Number(r.price),
    compareAtPrice: num(r.compare_at_price),
    categoryId: String(r.category_id),
    stockQty: Number(r.stock_qty ?? 0),
    availability: r.availability as Product["availability"],
    isFeatured: Boolean(r.is_featured),
    isNew: Boolean(r.is_new),
    isActive: Boolean(r.is_active),
    allowName: Boolean(r.allow_name),
    allowCardMessage: Boolean(r.allow_card_message),
    allowPhotoUpload: Boolean(r.allow_photo_upload),
    images,
    options,
    occasionIds: ((r.product_occasions as Row[]) ?? []).map((o) => String(o.occasion_id)),
    soldCount: Number(r.sold_count ?? 0),
    createdAt: String(r.created_at),
  };
};

export const ORDER_SELECT = "*, order_status_history(*)";

export const toOrder = (r: Row): Order => ({
  id: String(r.id),
  orderNumber: String(r.order_number),
  customerId: str(r.customer_id),
  customerName: String(r.customer_name),
  customerPhone: String(r.customer_phone),
  zoneId: str(r.zone_id),
  zoneNameAr: str(r.zone_name_ar),
  address: str(r.address),
  items: (r.items as Order["items"]) ?? [],
  subtotal: Number(r.subtotal),
  deliveryFee: Number(r.delivery_fee),
  discount: Number(r.discount),
  total: Number(r.total),
  couponCode: str(r.coupon_code),
  fulfillment: r.fulfillment as Order["fulfillment"],
  deliveryDate: str(r.delivery_date),
  timeSlot: str(r.time_slot),
  paymentMethod: r.payment_method as Order["paymentMethod"],
  receiptPath: str(r.receipt_path),
  status: r.status as Order["status"],
  notes: str(r.notes),
  createdAt: String(r.created_at),
  statusHistory: ((r.order_status_history as Row[]) ?? [])
    .map((h) => ({
      id: String(h.id),
      orderId: String(h.order_id),
      status: h.status as Order["status"],
      note: str(h.note),
      createdBy: str(h.created_by),
      createdAt: String(h.created_at),
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
});

/** Drop undefined keys so partial updates don't overwrite columns. */
function clean(row: Row): Row {
  return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
}
