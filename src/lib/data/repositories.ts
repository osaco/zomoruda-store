/**
 * Data-access contracts.
 *
 * Features talk to these interfaces only (via `getRepos()`), never to Supabase
 * directly. Two adapters implement them:
 *   - `demo/`     in-memory seed data, used when Supabase env vars are missing
 *   - `supabase/` the real Postgres database
 * Switching between them is purely an environment concern.
 */
import type {
  Availability,
  Banner,
  Category,
  Coupon,
  Customer,
  DeliveryZone,
  Id,
  Occasion,
  Order,
  OrderStatus,
  Product,
  Setting,
} from "@/types/db";

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export type ListOptions = {
  includeInactive?: boolean;
};

export type ProductSort = "newest" | "price_asc" | "price_desc" | "best_selling";

export type ProductQuery = {
  categorySlug?: string;
  occasionSlug?: string;
  search?: string;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  availability?: Availability;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
  includeInactive?: boolean;
};

export type OrderQuery = {
  status?: OrderStatus;
  search?: string;
  customerPhone?: string;
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
};

export type CustomerQuery = {
  search?: string;
  page?: number;
  perPage?: number;
};

/** A fully priced order, computed server-side by `buildOrder()`. */
export type NewOrderRecord = Omit<
  Order,
  "id" | "orderNumber" | "createdAt" | "statusHistory" | "status"
>;

export type ProductInput = Omit<Product, "id" | "createdAt" | "images" | "options" | "soldCount"> & {
  images: { url: string; altAr: string | null }[];
  options: { nameAr: string; values: { valueAr: string; priceDelta: number }[]; isRequired: boolean }[];
};

export type UpsertCustomerInput = {
  name: string;
  phone: string;
  birthday?: string | null;
  anniversary?: string | null;
  notes?: string | null;
};

export interface CrudRepository<T extends { id: Id }> {
  list(options?: ListOptions): Promise<T[]>;
  getById(id: Id): Promise<T | null>;
  create(input: Omit<T, "id">): Promise<T>;
  update(id: Id, input: Partial<Omit<T, "id">>): Promise<T | null>;
  remove(id: Id): Promise<void>;
}

export interface CategoryRepository extends CrudRepository<Category> {
  getBySlug(slug: string): Promise<Category | null>;
}

export interface OccasionRepository extends CrudRepository<Occasion> {
  getBySlug(slug: string): Promise<Occasion | null>;
}

export interface ProductRepository {
  list(query?: ProductQuery): Promise<Paginated<Product>>;
  getById(id: Id): Promise<Product | null>;
  getBySlug(slug: string): Promise<Product | null>;
  getManyByIds(ids: Id[]): Promise<Product[]>;
  featured(limit?: number): Promise<Product[]>;
  newest(limit?: number): Promise<Product[]>;
  related(productId: Id, limit?: number): Promise<Product[]>;
  create(input: ProductInput): Promise<Product>;
  update(id: Id, input: ProductInput): Promise<Product | null>;
  remove(id: Id): Promise<void>;
  adjustStock(id: Id, delta: number): Promise<void>;
}

export type DeliveryZoneRepository = CrudRepository<DeliveryZone>;
export type BannerRepository = CrudRepository<Banner>;

export interface CouponRepository extends CrudRepository<Coupon> {
  getByCode(code: string): Promise<Coupon | null>;
  incrementUsage(id: Id): Promise<void>;
}

export interface CustomerRepository {
  list(query?: CustomerQuery): Promise<Paginated<Customer>>;
  getById(id: Id): Promise<Customer | null>;
  getByPhone(phone: string): Promise<Customer | null>;
  upsertByPhone(input: UpsertCustomerInput): Promise<Customer>;
  update(id: Id, input: Partial<UpsertCustomerInput>): Promise<Customer | null>;
  recordOrder(customerId: Id, total: number): Promise<void>;
}

export interface OrderRepository {
  create(input: NewOrderRecord): Promise<Order>;
  getById(id: Id): Promise<Order | null>;
  getByNumber(orderNumber: string): Promise<Order | null>;
  list(query?: OrderQuery): Promise<Paginated<Order>>;
  all(query?: Pick<OrderQuery, "from" | "to">): Promise<Order[]>;
  updateStatus(id: Id, status: OrderStatus, note?: string | null, by?: string | null): Promise<Order | null>;
}

export interface SettingsRepository {
  all(): Promise<Setting[]>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export type Repositories = {
  mode: "demo" | "supabase";
  categories: CategoryRepository;
  occasions: OccasionRepository;
  products: ProductRepository;
  zones: DeliveryZoneRepository;
  coupons: CouponRepository;
  orders: OrderRepository;
  customers: CustomerRepository;
  banners: BannerRepository;
  settings: SettingsRepository;
};

export function paginate<T>(all: T[], page = 1, perPage = 12): Paginated<T> {
  const safePerPage = Math.max(1, perPage);
  const pageCount = Math.max(1, Math.ceil(all.length / safePerPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * safePerPage;
  return {
    items: all.slice(start, start + safePerPage),
    total: all.length,
    page: safePage,
    perPage: safePerPage,
    pageCount,
  };
}
