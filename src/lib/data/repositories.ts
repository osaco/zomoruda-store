import type {
  Availability,
  Coupon,
  Customer,
  DeliveryZone,
  Id,
  Order,
  OrderItem,
  OrderStatus,
  Banner,
  Category,
  Occasion,
  Product,
  Setting,
} from "@/types/db";
import type { FulfillmentType, PaymentMethod } from "@/types/enums";

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
  sort?: ProductSort;
  page?: number;
  perPage?: number;
};

export type OrderQuery = {
  status?: OrderStatus;
  search?: string;
  customerPhone?: string;
  page?: number;
  perPage?: number;
};

export type CustomerQuery = {
  search?: string;
  page?: number;
  perPage?: number;
};

export type CreateOrderItemInput = {
  productId: Id;
  quantity: number;
  options?: OrderItem["options"];
  customName?: string | null;
  cardMessage?: string | null;
  photoPath?: string | null;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  zoneId: Id | null;
  address?: string | null;
  items: CreateOrderItemInput[];
  fulfillment: FulfillmentType;
  deliveryDate?: string | null;
  timeSlot?: string | null;
  paymentMethod: PaymentMethod;
  couponCode?: string | null;
  notes?: string | null;
  receiptPath?: string | null;
};

export type UpsertCustomerInput = {
  name: string;
  phone: string;
  birthday?: string | null;
  anniversary?: string | null;
  notes?: string | null;
};

export interface CategoryRepository {
  list(options?: ListOptions): Promise<Category[]>;
  getById(id: Id): Promise<Category | null>;
  getBySlug(slug: string): Promise<Category | null>;
}

export interface OccasionRepository {
  list(options?: ListOptions): Promise<Occasion[]>;
  getById(id: Id): Promise<Occasion | null>;
  getBySlug(slug: string): Promise<Occasion | null>;
}

export interface ProductRepository {
  list(query?: ProductQuery): Promise<Paginated<Product>>;
  getById(id: Id): Promise<Product | null>;
  getBySlug(slug: string): Promise<Product | null>;
  featured(limit?: number): Promise<Product[]>;
  newest(limit?: number): Promise<Product[]>;
  related(productId: Id, limit?: number): Promise<Product[]>;
}

export interface DeliveryZoneRepository {
  list(options?: ListOptions): Promise<DeliveryZone[]>;
  getById(id: Id): Promise<DeliveryZone | null>;
}

export interface CouponRepository {
  list(options?: ListOptions): Promise<Coupon[]>;
  getById(id: Id): Promise<Coupon | null>;
  getByCode(code: string): Promise<Coupon | null>;
}

export interface CustomerRepository {
  list(query?: CustomerQuery): Promise<Paginated<Customer>>;
  getById(id: Id): Promise<Customer | null>;
  getByPhone(phone: string): Promise<Customer | null>;
  upsertByPhone(input: UpsertCustomerInput): Promise<Customer>;
  recordOrder(customerId: Id, total: number): Promise<Customer | null>;
}

export interface OrderRepository {
  create(input: CreateOrderInput): Promise<Order>;
  getById(id: Id): Promise<Order | null>;
  getByNumber(orderNumber: string): Promise<Order | null>;
  list(query?: OrderQuery): Promise<Paginated<Order>>;
  updateStatus(id: Id, status: OrderStatus, note?: string | null): Promise<Order | null>;
}

export interface BannerRepository {
  list(options?: ListOptions): Promise<Banner[]>;
  getById(id: Id): Promise<Banner | null>;
}

export interface SettingsRepository {
  all(): Promise<Setting[]>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export type Repositories = {
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
