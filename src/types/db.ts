import type {
  AdminRole,
  Availability,
  CouponType,
  FulfillmentType,
  OrderStatus,
  PaymentMethod,
} from "@/types/enums";

export type {
  AdminRole,
  Availability,
  CouponType,
  FulfillmentType,
  OrderStatus,
  PaymentMethod,
} from "@/types/enums";

export type Id = string;

export type Category = {
  id: Id;
  nameAr: string;
  slug: string;
  descriptionAr: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type Occasion = {
  id: Id;
  nameAr: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type ProductImage = {
  id: Id;
  productId: Id;
  url: string;
  altAr: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductOptionValue = {
  valueAr: string;
  priceDelta: number;
};

export type ProductOption = {
  id: Id;
  productId: Id;
  nameAr: string;
  values: ProductOptionValue[];
  isRequired: boolean;
  sortOrder: number;
};

export type Product = {
  id: Id;
  nameAr: string;
  slug: string;
  descriptionAr: string;
  price: number;
  compareAtPrice: number | null;
  categoryId: Id;
  stockQty: number;
  availability: Availability;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  allowName: boolean;
  allowCardMessage: boolean;
  allowPhotoUpload: boolean;
  images: ProductImage[];
  options: ProductOption[];
  occasionIds: Id[];
  soldCount: number;
  createdAt: string;
};

export type DeliveryZone = {
  id: Id;
  nameAr: string;
  fee: number;
  minOrder: number | null;
  deliveryTimeAr: string;
  sortOrder: number;
  isActive: boolean;
};

export type Coupon = {
  id: Id;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export type Customer = {
  id: Id;
  name: string;
  phone: string;
  birthday: string | null;
  anniversary: string | null;
  ordersCount: number;
  totalSpent: number;
  notes: string | null;
  createdAt: string;
};

export type OrderItemOption = {
  nameAr: string;
  valueAr: string;
  priceDelta: number;
};

export type OrderItem = {
  productId: Id;
  nameAr: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  options: OrderItemOption[];
  customName: string | null;
  cardMessage: string | null;
  photoPath: string | null;
  lineTotal: number;
};

export type OrderStatusHistory = {
  id: Id;
  orderId: Id;
  status: OrderStatus;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type Order = {
  id: Id;
  orderNumber: string;
  customerId: Id | null;
  customerName: string;
  customerPhone: string;
  zoneId: Id | null;
  zoneNameAr: string | null;
  address: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode: string | null;
  fulfillment: FulfillmentType;
  deliveryDate: string | null;
  timeSlot: string | null;
  paymentMethod: PaymentMethod;
  receiptPath: string | null;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  statusHistory: OrderStatusHistory[];
};

export type Banner = {
  id: Id;
  titleAr: string;
  subtitleAr: string | null;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

export type Setting = {
  key: string;
  value: string;
};

export type AdminUser = {
  id: Id;
  userId: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
};
