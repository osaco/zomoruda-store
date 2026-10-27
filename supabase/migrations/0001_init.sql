-- Zomoruda store — initial schema
-- Server code uses the service-role key (bypasses RLS). RLS below keeps the
-- public anon key read-only on catalog data and locks everything else.

create extension if not exists "pgcrypto";

create table categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  slug text not null unique,
  description_ar text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table occasions (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  slug text not null unique,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create type availability as enum ('in_stock', 'out_of_stock', 'made_to_order');

create table products (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  slug text not null unique,
  description_ar text not null default '',
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  category_id uuid not null references categories(id) on delete restrict,
  stock_qty int not null default 0,
  availability availability not null default 'in_stock',
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  allow_name boolean not null default false,
  allow_card_message boolean not null default false,
  allow_photo_upload boolean not null default false,
  sold_count int not null default 0,
  created_at timestamptz not null default now()
);
create index products_category_idx on products(category_id);
create index products_active_idx on products(is_active);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_ar text,
  sort_order int not null default 0,
  is_primary boolean not null default false
);

create table product_occasions (
  product_id uuid references products(id) on delete cascade,
  occasion_id uuid references occasions(id) on delete cascade,
  primary key (product_id, occasion_id)
);

create table product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name_ar text not null,
  values jsonb not null default '[]', -- [{ "value_ar": "كبير", "price_delta": 30 }]
  is_required boolean not null default true,
  sort_order int not null default 0
);

create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  fee numeric(10,2) not null default 0,
  min_order numeric(10,2),
  delivery_time_ar text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true
);

create type coupon_type as enum ('percent', 'fixed');

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type coupon_type not null,
  value numeric(10,2) not null,
  min_order numeric(10,2),
  max_discount numeric(10,2),
  usage_limit int,
  used_count int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  birthday date,
  anniversary date,
  orders_count int not null default 0,
  total_spent numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create type order_status as enum ('new', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
create type fulfillment as enum ('delivery', 'pickup');
create type payment_method as enum ('cash_on_delivery', 'bank_transfer');

create sequence order_number_seq start 1001;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ZM-' || lpad(nextval('order_number_seq')::text, 4, '0')),
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  zone_id uuid references delivery_zones(id) on delete set null,
  zone_name_ar text,
  address text,
  items jsonb not null, -- snapshot of OrderItem[]
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  coupon_code text,
  fulfillment fulfillment not null,
  delivery_date date,
  time_slot text,
  payment_method payment_method not null,
  receipt_path text,
  status order_status not null default 'new',
  notes text,
  created_at timestamptz not null default now()
);
create index orders_status_idx on orders(status);
create index orders_phone_idx on orders(customer_phone);
create index orders_created_idx on orders(created_at desc);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  note text,
  created_by text,
  created_at timestamptz not null default now()
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  title_ar text not null,
  subtitle_ar text,
  image_url text not null,
  link_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz
);

create table settings (
  key text primary key,
  value text not null
);

create type admin_role as enum ('admin', 'staff');
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  role admin_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Atomic helpers used by the server
create or replace function adjust_stock(p_id uuid, p_delta int) returns void
language sql as $$
  update products
     set stock_qty = greatest(0, stock_qty + p_delta),
         sold_count = sold_count + greatest(0, -p_delta),
         availability = case when greatest(0, stock_qty + p_delta) = 0 and availability = 'in_stock'
                             then 'out_of_stock'::availability else availability end
   where id = p_id;
$$;

create or replace function record_customer_order(p_id uuid, p_total numeric) returns void
language sql as $$
  update customers set orders_count = orders_count + 1, total_spent = total_spent + p_total where id = p_id;
$$;

create or replace function increment_coupon_usage(p_id uuid) returns void
language sql as $$
  update coupons set used_count = used_count + 1 where id = p_id;
$$;

-- Row Level Security
alter table categories enable row level security;
alter table occasions enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_occasions enable row level security;
alter table product_options enable row level security;
alter table delivery_zones enable row level security;
alter table banners enable row level security;
alter table coupons enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_status_history enable row level security;
alter table settings enable row level security;
alter table admin_users enable row level security;

create or replace function is_admin() returns boolean
language sql stable security definer as $$
  select exists (select 1 from admin_users where user_id = auth.uid() and is_active);
$$;

-- Public read of the active catalog
create policy "public read categories" on categories for select using (is_active or is_admin());
create policy "public read occasions" on occasions for select using (is_active or is_admin());
create policy "public read products" on products for select using (is_active or is_admin());
create policy "public read product_images" on product_images for select using (true);
create policy "public read product_occasions" on product_occasions for select using (true);
create policy "public read product_options" on product_options for select using (true);
create policy "public read zones" on delivery_zones for select using (is_active or is_admin());
create policy "public read banners" on banners for select using (is_active or is_admin());

-- Admin-only for everything else (and writes)
create policy "admin all categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin all occasions" on occasions for all using (is_admin()) with check (is_admin());
create policy "admin all products" on products for all using (is_admin()) with check (is_admin());
create policy "admin all product_images" on product_images for all using (is_admin()) with check (is_admin());
create policy "admin all product_occasions" on product_occasions for all using (is_admin()) with check (is_admin());
create policy "admin all product_options" on product_options for all using (is_admin()) with check (is_admin());
create policy "admin all zones" on delivery_zones for all using (is_admin()) with check (is_admin());
create policy "admin all banners" on banners for all using (is_admin()) with check (is_admin());
create policy "admin all coupons" on coupons for all using (is_admin()) with check (is_admin());
create policy "admin all customers" on customers for all using (is_admin()) with check (is_admin());
create policy "admin all orders" on orders for all using (is_admin()) with check (is_admin());
create policy "admin all history" on order_status_history for all using (is_admin()) with check (is_admin());
create policy "admin all settings" on settings for all using (is_admin()) with check (is_admin());
create policy "admin read self" on admin_users for select using (user_id = auth.uid() or is_admin());

-- Storage buckets: product images (public), customer uploads (private)
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false) on conflict do nothing;
