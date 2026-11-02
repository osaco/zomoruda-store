-- =============================================================================
-- Migration 0004: CRM & Coupon Synchronization on Order Status Transitions
-- Updates transition_order_status to keep customer orders_count, total_spent,
-- and coupon used_count in sync when orders are cancelled or re-activated.
-- =============================================================================

create or replace function public.transition_order_status(
  p_id uuid,
  p_status public.order_status,
  p_note text,
  p_by text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old_status public.order_status;
  v_items jsonb;
  v_customer_id uuid;
  v_total numeric;
  v_coupon_code text;
  v_product_id uuid;
  v_product public.products%rowtype;
  v_quantity integer;
begin
  select status, items, customer_id, total, coupon_code
    into v_old_status, v_items, v_customer_id, v_total, v_coupon_code
  from public.orders
  where id = p_id
  for update;
  if not found then return null; end if;
  if v_old_status = p_status then return p_id; end if;

  if v_old_status = 'cancelled' and p_status <> 'cancelled' then
    for v_product_id in
      select distinct (entry.value->>'productId')::uuid
      from jsonb_array_elements(v_items) as entry(value)
      order by 1
    loop
      select * into v_product from public.products where id = v_product_id for update;
      if not found then raise exception 'ORDER_STOCK_CONFLICT'; end if;
      select coalesce(sum((entry.value->>'quantity')::integer), 0)::integer into v_quantity
      from jsonb_array_elements(v_items) as entry(value)
      where (entry.value->>'productId')::uuid = v_product_id;
      if not v_product.is_active or v_product.availability = 'out_of_stock'
         or (v_product.availability = 'in_stock' and v_product.stock_qty < v_quantity) then
        raise exception 'ORDER_STOCK_CONFLICT';
      end if;
      update public.products
         set stock_qty = greatest(0, stock_qty - v_quantity),
             sold_count = sold_count + v_quantity,
             availability = case
               when availability = 'in_stock' and stock_qty - v_quantity = 0 then 'out_of_stock'::public.availability
               else availability
             end
       where id = v_product_id;
    end loop;

    if v_customer_id is not null then
      update public.customers
         set orders_count = orders_count + 1,
             total_spent = total_spent + v_total
       where id = v_customer_id;
    end if;

    if v_coupon_code is not null then
      update public.coupons
         set used_count = used_count + 1
       where code = v_coupon_code;
    end if;

  elsif v_old_status <> 'cancelled' and p_status = 'cancelled' then
    for v_product_id in
      select distinct (entry.value->>'productId')::uuid
      from jsonb_array_elements(v_items) as entry(value)
      order by 1
    loop
      select coalesce(sum((entry.value->>'quantity')::integer), 0)::integer into v_quantity
      from jsonb_array_elements(v_items) as entry(value)
      where (entry.value->>'productId')::uuid = v_product_id;
      update public.products
         set stock_qty = stock_qty + v_quantity,
             sold_count = greatest(0, sold_count - v_quantity),
             availability = case
               when availability = 'out_of_stock' then 'in_stock'::public.availability
               else availability
             end
       where id = v_product_id;
    end loop;

    if v_customer_id is not null then
      update public.customers
         set orders_count = greatest(0, orders_count - 1),
             total_spent = greatest(0, total_spent - v_total)
       where id = v_customer_id;
    end if;

    if v_coupon_code is not null then
      update public.coupons
         set used_count = greatest(0, used_count - 1)
       where code = v_coupon_code;
    end if;
  end if;

  update public.orders set status = p_status where id = p_id;
  insert into public.order_status_history (order_id, status, note, created_by)
  values (p_id, p_status, p_note, p_by);
  return p_id;
end;
$$;

revoke all on function public.transition_order_status(uuid, public.order_status, text, text) from public, anon, authenticated;
grant execute on function public.transition_order_status(uuid, public.order_status, text, text) to service_role;
