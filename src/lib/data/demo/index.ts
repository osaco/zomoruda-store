/**
 * In-memory adapter used when Supabase is not configured.
 * State lives on globalThis so it survives hot reloads in development.
 * On serverless hosts it resets on cold start — fine for demos, not for production.
 */
import type { Customer, Id, Order, Product } from "@/types/db";
import { formatOrderNumber } from "@/lib/pricing";
import {
  paginate,
  type CrudRepository,
  type ProductQuery,
  type Repositories,
} from "../repositories";
import {
  seedBanners,
  seedCategories,
  seedCoupons,
  seedOccasions,
  seedProducts,
  seedSettings,
  seedZones,
} from "./seed";
import { buildDemoOrders } from "./sample-orders";

type DemoState = {
  categories: typeof seedCategories;
  occasions: typeof seedOccasions;
  products: Product[];
  zones: typeof seedZones;
  coupons: typeof seedCoupons;
  banners: typeof seedBanners;
  settings: Map<string, string>;
  customers: Customer[];
  orders: Order[];
  sequence: number;
};

const clone = <T>(value: T): T => structuredClone(value);
const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const now = () => new Date().toISOString();

function createState(): DemoState {
  const products = clone(seedProducts);
  const { customers, orders } = buildDemoOrders(products, seedZones);
  return {
    categories: clone(seedCategories),
    occasions: clone(seedOccasions),
    products,
    zones: clone(seedZones),
    coupons: clone(seedCoupons),
    banners: clone(seedBanners),
    settings: new Map(seedSettings.map((s) => [s.key, s.value])),
    customers,
    orders,
    sequence: 1000 + orders.length,
  };
}

const globalForDemo = globalThis as unknown as { __zomorudaDemo?: DemoState };
function state(): DemoState {
  globalForDemo.__zomorudaDemo ??= createState();
  return globalForDemo.__zomorudaDemo;
}

function crud<T extends { id: Id; sortOrder?: number; isActive?: boolean }>(
  key: "categories" | "occasions" | "zones" | "banners" | "coupons",
  prefix: string,
): CrudRepository<T> {
  const items = () => state()[key] as unknown as T[];
  return {
    async list(options) {
      const list = items().filter((i) => options?.includeInactive || i.isActive !== false);
      return clone(
        list.every((i) => typeof i.sortOrder === "number")
          ? [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          : list,
      );
    },
    async getById(id) {
      return clone(items().find((i) => i.id === id) ?? null);
    },
    async create(input) {
      const created = { ...input, id: newId(prefix) } as T;
      items().push(created);
      return clone(created);
    },
    async update(id, input) {
      const item = items().find((i) => i.id === id);
      if (!item) return null;
      Object.assign(item, input);
      return clone(item);
    },
    async remove(id) {
      const list = items();
      const index = list.findIndex((i) => i.id === id);
      if (index >= 0) list.splice(index, 1);
    },
  };
}

function matchesQuery(product: Product, query: ProductQuery): boolean {
  const s = state();
  if (!query.includeInactive && !product.isActive) return false;
  if (query.categorySlug) {
    const category = s.categories.find((c) => c.slug === query.categorySlug);
    if (!category || product.categoryId !== category.id) return false;
  }
  if (query.occasionSlug) {
    const occasion = s.occasions.find((o) => o.slug === query.occasionSlug);
    if (!occasion || !product.occasionIds.includes(occasion.id)) return false;
  }
  if (query.search) {
    const term = query.search.trim().toLowerCase();
    const haystack = `${product.nameAr} ${product.descriptionAr} ${product.slug}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  if (query.featured && !product.isFeatured) return false;
  if (query.isNew && !product.isNew) return false;
  if (query.onSale && !(product.compareAtPrice && product.compareAtPrice > product.price)) return false;
  if (query.availability && product.availability !== query.availability) return false;
  if (query.minPrice !== undefined && product.price < query.minPrice) return false;
  if (query.maxPrice !== undefined && product.price > query.maxPrice) return false;
  return true;
}

function sortProducts(list: Product[], sort: ProductQuery["sort"] = "newest") {
  const sorted = [...list];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "best_selling":
      return sorted.sort((a, b) => b.soldCount - a.soldCount);
    default:
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export function createDemoRepositories(): Repositories {
  return {
    mode: "demo",
    categories: {
      ...crud("categories", "cat"),
      async getBySlug(slug) {
        return clone(state().categories.find((c) => c.slug === slug) ?? null);
      },
    },
    occasions: {
      ...crud("occasions", "occ"),
      async getBySlug(slug) {
        return clone(state().occasions.find((o) => o.slug === slug) ?? null);
      },
    },
    zones: crud("zones", "zone"),
    banners: crud("banners", "ban"),
    coupons: {
      ...crud("coupons", "cpn"),
      async getByCode(code) {
        const normalized = code.trim().toUpperCase();
        return clone(state().coupons.find((c) => c.code.toUpperCase() === normalized) ?? null);
      },
      async incrementUsage(id) {
        const coupon = state().coupons.find((c) => c.id === id);
        if (coupon) coupon.usedCount += 1;
      },
    },
    products: {
      async list(query = {}) {
        const filtered = state().products.filter((p) => matchesQuery(p, query));
        return clone(paginate(sortProducts(filtered, query.sort), query.page, query.perPage));
      },
      async getById(id) {
        return clone(state().products.find((p) => p.id === id) ?? null);
      },
      async getBySlug(slug) {
        return clone(state().products.find((p) => p.slug === slug) ?? null);
      },
      async getManyByIds(ids) {
        return clone(state().products.filter((p) => ids.includes(p.id)));
      },
      async featured(limit = 8) {
        return clone(sortProducts(state().products.filter((p) => p.isActive && p.isFeatured), "best_selling").slice(0, limit));
      },
      async newest(limit = 8) {
        return clone(sortProducts(state().products.filter((p) => p.isActive), "newest").slice(0, limit));
      },
      async related(productId, limit = 4) {
        const product = state().products.find((p) => p.id === productId);
        if (!product) return [];
        return clone(
          state()
            .products.filter((p) => p.isActive && p.id !== productId && p.categoryId === product.categoryId)
            .concat(state().products.filter((p) => p.isActive && p.id !== productId && p.categoryId !== product.categoryId))
            .slice(0, limit),
        );
      },
      async create(input) {
        const id = newId("prd");
        const product: Product = {
          ...input,
          id,
          soldCount: 0,
          createdAt: now(),
          images: input.images.map((image, i) => ({ id: `${id}-img-${i}`, productId: id, url: image.url, altAr: image.altAr, sortOrder: i, isPrimary: i === 0 })),
          options: input.options.map((o, i) => ({ ...o, id: `${id}-opt-${i}`, productId: id, sortOrder: i })),
        };
        state().products.push(product);
        return clone(product);
      },
      async update(id, input) {
        const product = state().products.find((p) => p.id === id);
        if (!product) return null;
        Object.assign(product, {
          ...input,
          images: input.images.map((image, i) => ({ id: `${id}-img-${i}`, productId: id, url: image.url, altAr: image.altAr, sortOrder: i, isPrimary: i === 0 })),
          options: input.options.map((o, i) => ({ ...o, id: `${id}-opt-${i}`, productId: id, sortOrder: i })),
        });
        return clone(product);
      },
      async remove(id) {
        const s = state();
        s.products = s.products.filter((p) => p.id !== id);
      },
      async adjustStock(id, delta) {
        const product = state().products.find((p) => p.id === id);
        if (!product) return;
        product.stockQty = Math.max(0, product.stockQty + delta);
        product.soldCount = Math.max(0, product.soldCount - delta);
        if (product.stockQty === 0 && product.availability === "in_stock") product.availability = "out_of_stock";
        else if (delta > 0 && product.availability === "out_of_stock") product.availability = "in_stock";
      },
    },
    customers: {
      async list(query = {}) {
        const term = query.search?.trim();
        const list = state()
          .customers.filter((c) => !term || c.name.includes(term) || c.phone.includes(term))
          .sort((a, b) => b.totalSpent - a.totalSpent);
        return clone(paginate(list, query.page, query.perPage ?? 20));
      },
      async getById(id) {
        return clone(state().customers.find((c) => c.id === id) ?? null);
      },
      async getByPhone(phone) {
        return clone(state().customers.find((c) => c.phone === phone) ?? null);
      },
      async upsertByPhone(input) {
        const s = state();
        let customer = s.customers.find((c) => c.phone === input.phone);
        if (customer) {
          customer.name = input.name || customer.name;
          if (input.birthday !== undefined) customer.birthday = input.birthday;
          if (input.anniversary !== undefined) customer.anniversary = input.anniversary;
        } else {
          customer = {
            id: newId("cus"),
            name: input.name,
            phone: input.phone,
            birthday: input.birthday ?? null,
            anniversary: input.anniversary ?? null,
            notes: input.notes ?? null,
            ordersCount: 0,
            totalSpent: 0,
            createdAt: now(),
          };
          s.customers.push(customer);
        }
        return clone(customer);
      },
      async update(id, input) {
        const customer = state().customers.find((c) => c.id === id);
        if (!customer) return null;
        Object.assign(customer, input);
        return clone(customer);
      },
      async recordOrder(customerId, total) {
        const customer = state().customers.find((c) => c.id === customerId);
        if (!customer) return;
        customer.ordersCount += 1;
        customer.totalSpent += total;
      },
    },
    orders: {
      async create(input) {
        const s = state();
        s.sequence += 1;
        const id = newId("ord");
        const createdAt = now();
        const order: Order = {
          ...input,
          id,
          orderNumber: formatOrderNumber(s.sequence),
          status: "new",
          createdAt,
          statusHistory: [{ id: newId("hist"), orderId: id, status: "new", note: "تم استلام الطلب", createdBy: null, createdAt }],
        };
        s.orders.unshift(order);
        return clone(order);
      },
      async getById(id) {
        return clone(state().orders.find((o) => o.id === id) ?? null);
      },
      async getByNumber(orderNumber) {
        const normalized = orderNumber.trim().toUpperCase();
        return clone(state().orders.find((o) => o.orderNumber === normalized) ?? null);
      },
      async list(query = {}) {
        const term = query.search?.trim().toUpperCase();
        const list = state().orders.filter(
          (o) =>
            (!query.status || o.status === query.status) &&
            (!query.customerPhone || o.customerPhone === query.customerPhone) &&
            (!term || o.orderNumber.includes(term) || o.customerName.toUpperCase().includes(term) || o.customerPhone.includes(term)),
        );
        return clone(paginate(list, query.page, query.perPage ?? 20));
      },
      async all(query = {}) {
        return clone(
          state().orders.filter(
            (o) => (!query.from || o.createdAt >= query.from) && (!query.to || o.createdAt <= query.to),
          ),
        );
      },
      async updateStatus(id, status, note = null, by = null) {
        const order = state().orders.find((o) => o.id === id);
        if (!order) return null;
        order.status = status;
        order.statusHistory.push({ id: newId("hist"), orderId: id, status, note, createdBy: by, createdAt: now() });
        return clone(order);
      },
    },
    settings: {
      async all() {
        return [...state().settings.entries()].map(([key, value]) => ({ key, value }));
      },
      async get(key) {
        return state().settings.get(key) ?? null;
      },
      async set(key, value) {
        state().settings.set(key, value);
      },
    },
  };
}

