-- Tighten the initial RLS policies and remove unused helper functions.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.is_admin() returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and is_active
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;

alter policy "public read categories" on public.categories
  using (is_active or (select private.is_admin()));
alter policy "public read occasions" on public.occasions
  using (is_active or (select private.is_admin()));
alter policy "public read products" on public.products
  using (is_active or (select private.is_admin()));
alter policy "public read product_images" on public.product_images
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and (p.is_active or (select private.is_admin()))
    )
  );
alter policy "public read product_occasions" on public.product_occasions
  using (
    exists (
      select 1 from public.products p
      where p.id = product_occasions.product_id
        and (p.is_active or (select private.is_admin()))
    )
  );
alter policy "public read product_options" on public.product_options
  using (
    exists (
      select 1 from public.products p
      where p.id = product_options.product_id
        and (p.is_active or (select private.is_admin()))
    )
  );
alter policy "public read zones" on public.delivery_zones
  using (is_active or (select private.is_admin()));
alter policy "public read banners" on public.banners
  using (is_active or (select private.is_admin()));

do $$
declare
  policy_row record;
begin
  for policy_row in
    select * from (values
      ('categories', 'admin all categories', 'categories', true),
      ('occasions', 'admin all occasions', 'occasions', true),
      ('products', 'admin all products', 'products', true),
      ('product_images', 'admin all product_images', 'product_images', true),
      ('product_occasions', 'admin all product_occasions', 'product_occasions', true),
      ('product_options', 'admin all product_options', 'product_options', true),
      ('delivery_zones', 'admin all zones', 'zones', true),
      ('banners', 'admin all banners', 'banners', true),
      ('coupons', 'admin all coupons', 'coupons', false),
      ('customers', 'admin all customers', 'customers', false),
      ('orders', 'admin all orders', 'orders', false),
      ('order_status_history', 'admin all history', 'history', false),
      ('settings', 'admin all settings', 'settings', false)
    ) as policies(table_name, legacy_policy, policy_suffix, has_public_read)
  loop
    execute format('drop policy if exists %I on public.%I', policy_row.legacy_policy, policy_row.table_name);

    if not policy_row.has_public_read then
      execute format(
        'create policy %I on public.%I for select to authenticated using ((select private.is_admin()))',
        'admin select ' || policy_row.policy_suffix,
        policy_row.table_name
      );
    end if;

    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.is_admin()))',
      'admin insert ' || policy_row.policy_suffix,
      policy_row.table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      'admin update ' || policy_row.policy_suffix,
      policy_row.table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.is_admin()))',
      'admin delete ' || policy_row.policy_suffix,
      policy_row.table_name
    );
  end loop;
end;
$$;

drop policy if exists "admin read self" on public.admin_users;
create policy "admin read self" on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

drop function if exists public.is_admin();
drop function if exists public.adjust_stock(uuid, integer);
drop function if exists public.record_customer_order(uuid, numeric);
drop function if exists public.increment_coupon_usage(uuid);

create index if not exists order_status_history_order_id_idx on public.order_status_history(order_id);
create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_zone_id_idx on public.orders(zone_id);
create index if not exists product_images_product_id_idx on public.product_images(product_id);
create index if not exists product_occasions_occasion_id_idx on public.product_occasions(occasion_id);
create index if not exists product_options_product_id_idx on public.product_options(product_id);
