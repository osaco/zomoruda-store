import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Id, OrderStatus, Product } from "@/types/db";
import {
  paginate,
  type CrudRepository,
  type Paginated,
  type ProductInput,
  type Repositories,
} from "../repositories";
import {
  fromBanner,
  fromCategory,
  fromCoupon,
  fromOccasion,
  fromZone,
  ORDER_SELECT,
  PRODUCT_SELECT,
  toBanner,
  toCategory,
  toCoupon,
  toCustomer,
  toOccasion,
  toOrder,
  toProduct,
  toZone,
} from "./mappers";

type Row = Record<string, unknown>;

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Supabase: ${result.error.message}`);
  return result.data;
}

function crud<T extends { id: Id }>(
  db: () => SupabaseClient,
  table: string,
  toDomain: (r: Row) => T,
  fromDomain: (v: Partial<T>) => Row,
  ordered = true,
): CrudRepository<T> {
  return {
    async list(options) {
      let query = db().from(table).select("*");
      if (!options?.includeInactive) query = query.eq("is_active", true);
      if (ordered) query = query.order("sort_order");
      return (check(await query) as Row[]).map(toDomain);
    },
    async getById(id) {
      const data = check(await db().from(table).select("*").eq("id", id).maybeSingle());
      return data ? toDomain(data as Row) : null;
    },
    async create(input) {
      const data = check(await db().from(table).insert(fromDomain(input as Partial<T>)).select("*").single());
      return toDomain(data as Row);
    },
    async update(id, input) {
      const data = check(await db().from(table).update(fromDomain(input as Partial<T>)).eq("id", id).select("*").maybeSingle());
      return data ? toDomain(data as Row) : null;
    },
    async remove(id) {
      check(await db().from(table).delete().eq("id", id));
    },
  };
}

async function writeProductChildren(db: SupabaseClient, id: Id, input: ProductInput) {
  check(await db.from("product_images").delete().eq("product_id", id));
  check(await db.from("product_options").delete().eq("product_id", id));
  check(await db.from("product_occasions").delete().eq("product_id", id));
  if (input.images.length)
    check(await db.from("product_images").insert(input.images.map((i, n) => ({ product_id: id, url: i.url, alt_ar: i.altAr, sort_order: n, is_primary: n === 0 }))));
  if (input.options.length)
    check(await db.from("product_options").insert(input.options.map((o, n) => ({ product_id: id, name_ar: o.nameAr, is_required: o.isRequired, sort_order: n, values: o.values.map((v) => ({ value_ar: v.valueAr, price_delta: v.priceDelta })) }))));
  if (input.occasionIds.length)
    check(await db.from("product_occasions").insert(input.occasionIds.map((occasion_id) => ({ product_id: id, occasion_id }))));
}

const productRow = (p: ProductInput): Row => ({
  name_ar: p.nameAr,
  slug: p.slug,
  description_ar: p.descriptionAr,
  price: p.price,
  compare_at_price: p.compareAtPrice,
  category_id: p.categoryId,
  stock_qty: p.stockQty,
  availability: p.availability,
  is_featured: p.isFeatured,
  is_new: p.isNew,
  is_active: p.isActive,
  allow_name: p.allowName,
  allow_card_message: p.allowCardMessage,
  allow_photo_upload: p.allowPhotoUpload,
});

export function createSupabaseRepositories(): Repositories {
  const db = supabaseAdmin;

  const categories = crud(db, "categories", toCategory, fromCategory);
  const occasions = crud(db, "occasions", toOccasion, fromOccasion);
  const coupons = crud(db, "coupons", toCoupon, fromCoupon, false);

  async function idForSlug(table: string, slug: string) {
    const data = check(await db().from(table).select("id").eq("slug", slug).maybeSingle()) as Row | null;
    return data ? String(data.id) : null;
  }

  return {
    mode: "supabase",
    categories: {
      ...categories,
      async getBySlug(slug) {
        const data = check(await db().from("categories").select("*").eq("slug", slug).maybeSingle());
        return data ? toCategory(data as Row) : null;
      },
    },
    occasions: {
      ...occasions,
      async getBySlug(slug) {
        const data = check(await db().from("occasions").select("*").eq("slug", slug).maybeSingle());
        return data ? toOccasion(data as Row) : null;
      },
    },
    zones: crud(db, "delivery_zones", toZone, fromZone),
    banners: crud(db, "banners", toBanner, fromBanner),
    coupons: {
      ...coupons,
      async getByCode(code) {
        const data = check(await db().from("coupons").select("*").eq("code", code.trim().toUpperCase()).maybeSingle());
        return data ? toCoupon(data as Row) : null;
      },
    },
    products: {
      async list(query = {}): Promise<Paginated<Product>> {
        const page = query.page ?? 1;
        const perPage = query.perPage ?? 12;
        let q = db().from("products").select(PRODUCT_SELECT, { count: "exact" });
        if (!query.includeInactive) q = q.eq("is_active", true);
        if (query.categorySlug) {
          const id = await idForSlug("categories", query.categorySlug);
          if (!id) return paginate([], page, perPage);
          q = q.eq("category_id", id);
        }
        if (query.occasionSlug) {
          const id = await idForSlug("occasions", query.occasionSlug);
          if (!id) return paginate([], page, perPage);
          const links = check(await db().from("product_occasions").select("product_id").eq("occasion_id", id)) as Row[];
          q = q.in("id", links.map((l) => String(l.product_id)));
        }
        if (query.search) q = q.or(`name_ar.ilike.%${query.search}%,description_ar.ilike.%${query.search}%`);
        if (query.featured) q = q.eq("is_featured", true);
        if (query.isNew) q = q.eq("is_new", true);
        if (query.onSale) q = q.not("compare_at_price", "is", null);
        if (query.availability) q = q.eq("availability", query.availability);
        if (query.minPrice !== undefined) q = q.gte("price", query.minPrice);
        if (query.maxPrice !== undefined) q = q.lte("price", query.maxPrice);
        const sort = query.sort ?? "newest";
        q =
          sort === "price_asc" ? q.order("price") :
          sort === "price_desc" ? q.order("price", { ascending: false }) :
          sort === "best_selling" ? q.order("sold_count", { ascending: false }) :
          q.order("created_at", { ascending: false });
        const from = (page - 1) * perPage;
        const result = await q.range(from, from + perPage - 1);
        const rows = check(result) as Row[];
        const total = result.count ?? rows.length;
        return { items: rows.map(toProduct), total, page, perPage, pageCount: Math.max(1, Math.ceil(total / perPage)) };
      },
      async getById(id) {
        const data = check(await db().from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle());
        return data ? toProduct(data as Row) : null;
      },
      async getBySlug(slug) {
        const data = check(await db().from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle());
        return data ? toProduct(data as Row) : null;
      },
      async getManyByIds(ids) {
        if (!ids.length) return [];
        return (check(await db().from("products").select(PRODUCT_SELECT).in("id", ids)) as Row[]).map(toProduct);
      },
      async featured(limit = 8) {
        return (check(await db().from("products").select(PRODUCT_SELECT).eq("is_active", true).eq("is_featured", true).order("sold_count", { ascending: false }).limit(limit)) as Row[]).map(toProduct);
      },
      async newest(limit = 8) {
        return (check(await db().from("products").select(PRODUCT_SELECT).eq("is_active", true).order("created_at", { ascending: false }).limit(limit)) as Row[]).map(toProduct);
      },
      async related(productId, limit = 4) {
        const product = await this.getById(productId);
        if (!product) return [];
        return (check(await db().from("products").select(PRODUCT_SELECT).eq("is_active", true).eq("category_id", product.categoryId).neq("id", productId).limit(limit)) as Row[]).map(toProduct);
      },
      async create(input) {
        const row = check(await db().from("products").insert(productRow(input)).select("id").single()) as Row;
        await writeProductChildren(db(), String(row.id), input);
        return (await this.getById(String(row.id)))!;
      },
      async update(id, input) {
        check(await db().from("products").update(productRow(input)).eq("id", id));
        await writeProductChildren(db(), id, input);
        return this.getById(id);
      },
      async remove(id) {
        check(await db().from("products").delete().eq("id", id));
      },
    },
    customers: {
      async list(query = {}) {
        const page = query.page ?? 1;
        const perPage = query.perPage ?? 20;
        let q = db().from("customers").select("*", { count: "exact" }).order("total_spent", { ascending: false }).order("id");
        if (query.search) q = q.or(`name.ilike.%${query.search}%,phone.ilike.%${query.search}%`);
        const from = (page - 1) * perPage;
        const result = await q.range(from, from + perPage - 1);
        const rows = check(result) as Row[];
        const total = result.count ?? rows.length;
        return { items: rows.map(toCustomer), total, page, perPage, pageCount: Math.max(1, Math.ceil(total / perPage)) };
      },
      async getById(id) {
        const data = check(await db().from("customers").select("*").eq("id", id).maybeSingle());
        return data ? toCustomer(data as Row) : null;
      },
      async getByPhone(phone) {
        const data = check(await db().from("customers").select("*").eq("phone", phone).maybeSingle());
        return data ? toCustomer(data as Row) : null;
      },
      async upsertByPhone(input) {
        const row: Row = { name: input.name, phone: input.phone };
        if (input.birthday !== undefined) row.birthday = input.birthday;
        if (input.anniversary !== undefined) row.anniversary = input.anniversary;
        const data = check(await db().from("customers").upsert(row, { onConflict: "phone" }).select("*").single());
        return toCustomer(data as Row);
      },
      async update(id, input) {
        const data = check(await db().from("customers").update(input).eq("id", id).select("*").maybeSingle());
        return data ? toCustomer(data as Row) : null;
      },
    },
    orders: {
      async placeCheckoutOrder(input, customer, couponId) {
        const result = await db().rpc("place_checkout_order", {
          p_order: input,
          p_customer_name: customer.name,
          p_customer_phone: customer.phone,
          p_birthday: customer.birthday ?? null,
          p_coupon_id: couponId,
        });
        if (result.error) {
          if (result.error.message.includes("CHECKOUT_CONFLICT")) return null;
          throw new Error(`Supabase: ${result.error.message}`);
        }
        return result.data ? this.getById(String(result.data)) : null;
      },
      async getById(id) {
        const data = check(await db().from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle());
        return data ? toOrder(data as Row) : null;
      },
      async getByNumber(orderNumber) {
        const data = check(await db().from("orders").select(ORDER_SELECT).eq("order_number", orderNumber.trim().toUpperCase()).maybeSingle());
        return data ? toOrder(data as Row) : null;
      },
      async list(query = {}) {
        const page = query.page ?? 1;
        const perPage = query.perPage ?? 20;
        let q = db().from("orders").select(ORDER_SELECT, { count: "exact" }).order("created_at", { ascending: false }).order("id", { ascending: false });
        if (query.status) q = q.eq("status", query.status);
        if (query.customerPhone) q = q.eq("customer_phone", query.customerPhone);
        if (query.search) q = q.or(`order_number.ilike.%${query.search}%,customer_name.ilike.%${query.search}%,customer_phone.ilike.%${query.search}%`);
        const from = (page - 1) * perPage;
        const result = await q.range(from, from + perPage - 1);
        const rows = check(result) as Row[];
        const total = result.count ?? rows.length;
        return { items: rows.map(toOrder), total, page, perPage, pageCount: Math.max(1, Math.ceil(total / perPage)) };
      },
      async all(query = {}) {
        const pageSize = 500;
        const rows: Row[] = [];
        for (let offset = 0; ; offset += pageSize) {
          let q = db().from("orders").select(ORDER_SELECT)
            .order("created_at", { ascending: false }).order("id", { ascending: false })
            .range(offset, offset + pageSize - 1);
          if (query.from) q = q.gte("created_at", query.from);
          if (query.to) q = q.lte("created_at", query.to);
          const batch = check(await q) as Row[];
          rows.push(...batch);
          if (batch.length < pageSize) break;
        }
        return rows.map(toOrder);
      },
      async updateStatus(id, status, note = null, by = null) {
        const result = await db().rpc("transition_order_status", {
          p_id: id,
          p_status: status as OrderStatus,
          p_note: note,
          p_by: by,
        });
        if (result.error) {
          if (result.error.message.includes("ORDER_STOCK_CONFLICT")) return null;
          throw new Error(`Supabase: ${result.error.message}`);
        }
        return result.data ? this.getById(String(result.data)) : null;
      },
    },
    settings: {
      async all() {
        return (check(await db().from("settings").select("*")) as Row[]).map((r) => ({ key: String(r.key), value: String(r.value) }));
      },
      async get(key) {
        const data = check(await db().from("settings").select("value").eq("key", key).maybeSingle()) as Row | null;
        return data ? String(data.value) : null;
      },
      async set(key, value) {
        check(await db().from("settings").upsert({ key, value }));
      },
    },
  };
}
