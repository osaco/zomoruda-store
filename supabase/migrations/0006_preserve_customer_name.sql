-- =============================================================================
-- Migration 0006: Preserve existing customer name in CRM on phone conflict
-- Prevents secondary checkouts from overwriting a registered customer's name.
-- =============================================================================

create or replace function public.place_checkout_order(
  p_order jsonb,
  p_customer_name text,
  p_customer_phone text,
  p_birthday date,
  p_coupon_id uuid
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
  v_product public.products%rowtype;
  v_zone public.delivery_zones%rowtype;
  v_coupon public.coupons%rowtype;
  v_customer_id uuid;
  v_order_id uuid;
  v_item jsonb;
  v_option jsonb;
  v_delta numeric;
  v_delta_sum numeric;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_delivery_fee numeric := 0;
  v_discount numeric := 0;
  v_raw_discount numeric := 0;
  v_total numeric;
  v_quantity integer;
  v_now timestamptz := clock_timestamp();
begin
  if coalesce(jsonb_typeof(p_order->'items') <> 'array', true) then
    raise exception 'CHECKOUT_CONFLICT';
  end if;
  if jsonb_array_length(p_order->'items') = 0
     or p_customer_name is null or length(trim(p_customer_name)) < 2
     or p_customer_phone is null then
    raise exception 'CHECKOUT_CONFLICT';
  end if;

  -- Lock each SKU once in a stable order, then reserve aggregate quantities.
  for v_product_id in
    select distinct (entry.value->>'productId')::uuid
    from jsonb_array_elements(p_order->'items') as entry(value)
    order by 1
  loop
    select * into v_product
    from public.products
    where id = v_product_id
    for update;
    if not found or not v_product.is_active or v_product.availability = 'out_of_stock' then
      raise exception 'CHECKOUT_CONFLICT';
    end if;

    select coalesce(sum((entry.value->>'quantity')::integer), 0)::integer into v_quantity
    from jsonb_array_elements(p_order->'items') as entry(value)
    where (entry.value->>'productId')::uuid = v_product_id;
    if v_quantity < 1 or (v_product.availability = 'in_stock' and v_product.stock_qty < v_quantity) then
      raise exception 'CHECKOUT_CONFLICT';
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

  -- Re-check current prices and option values while the product rows remain locked.
  for v_item in select entry.value from jsonb_array_elements(p_order->'items') as entry(value)
  loop
    v_product_id := (v_item->>'productId')::uuid;
    select * into v_product from public.products where id = v_product_id;
    if v_product.price <> (v_item->>'price')::numeric then
      raise exception 'CHECKOUT_CONFLICT';
    end if;

    if exists (
      select 1
      from public.product_options required_option
      where required_option.product_id = v_product_id
        and required_option.is_required
        and not exists (
          select 1
          from jsonb_array_elements(coalesce(v_item->'options', '[]'::jsonb)) as picked(value)
          where picked.value->>'nameAr' = required_option.name_ar
        )
    ) then
      raise exception 'CHECKOUT_CONFLICT';
    end if;

    v_delta_sum := 0;
    for v_option in select picked.value from jsonb_array_elements(coalesce(v_item->'options', '[]'::jsonb)) as picked(value)
    loop
      select (choice.value->>'price_delta')::numeric into v_delta
      from public.product_options product_option,
           jsonb_array_elements(product_option.values) as choice(value)
      where product_option.product_id = v_product_id
        and product_option.name_ar = v_option->>'nameAr'
        and choice.value->>'value_ar' = v_option->>'valueAr'
      limit 1;
      if not found or v_delta <> coalesce((v_option->>'priceDelta')::numeric, 0) then
        raise exception 'CHECKOUT_CONFLICT';
      end if;
      v_delta_sum := v_delta_sum + v_delta;
    end loop;

    v_quantity := (v_item->>'quantity')::integer;
    v_line_total := round(greatest(0, v_product.price + v_delta_sum) * v_quantity, 2);
    if v_quantity < 1 or v_quantity > 50 or v_line_total <> (v_item->>'lineTotal')::numeric then
      raise exception 'CHECKOUT_CONFLICT';
    end if;
    v_subtotal := v_subtotal + v_line_total;
  end loop;
  v_subtotal := round(v_subtotal, 2);
  if v_subtotal <> (p_order->>'subtotal')::numeric then
    raise exception 'CHECKOUT_CONFLICT';
  end if;

  if p_order->>'fulfillment' = 'delivery' then
    select * into v_zone
    from public.delivery_zones
    where id = (p_order->>'zoneId')::uuid
    for share;
    if not found or not v_zone.is_active
       or (v_zone.min_order is not null and v_subtotal < v_zone.min_order) then
      raise exception 'CHECKOUT_CONFLICT';
    end if;
    v_delivery_fee := v_zone.fee;
  elsif p_order->>'fulfillment' <> 'pickup' then
    raise exception 'CHECKOUT_CONFLICT';
  end if;
  if v_delivery_fee <> (p_order->>'deliveryFee')::numeric then
    raise exception 'CHECKOUT_CONFLICT';
  end if;

  if p_coupon_id is not null then
    select * into v_coupon from public.coupons where id = p_coupon_id for update;
    if not found or not v_coupon.is_active
       or (v_coupon.starts_at is not null and v_coupon.starts_at > v_now)
       or (v_coupon.ends_at is not null and v_coupon.ends_at < v_now)
       or (v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit)
       or (v_coupon.min_order is not null and v_subtotal < v_coupon.min_order)
       or v_coupon.code <> p_order->>'couponCode' then
      raise exception 'CHECKOUT_CONFLICT';
    end if;
    v_raw_discount := case
      when v_coupon.type = 'fixed' then v_coupon.value
      else v_subtotal * v_coupon.value / 100
    end;
    v_discount := round(least(v_subtotal, least(v_raw_discount, coalesce(v_coupon.max_discount, v_raw_discount))), 2);
    if v_discount <> (p_order->>'discount')::numeric then
      raise exception 'CHECKOUT_CONFLICT';
    end if;
    update public.coupons set used_count = used_count + 1 where id = p_coupon_id;
  elsif coalesce(p_order->>'couponCode', '') <> '' or (p_order->>'discount')::numeric <> 0 then
    raise exception 'CHECKOUT_CONFLICT';
  end if;

  v_total := round(greatest(0, v_subtotal + v_delivery_fee - v_discount), 2);
  if v_total <> (p_order->>'total')::numeric
     or p_customer_name <> p_order->>'customerName'
     or p_customer_phone <> p_order->>'customerPhone' then
    raise exception 'CHECKOUT_CONFLICT';
  end if;

  insert into public.customers as existing_customer (name, phone, birthday)
  values (p_customer_name, p_customer_phone, p_birthday)
  on conflict (phone) do update
    set name = coalesce(nullif(existing_customer.name, ''), excluded.name),
        birthday = coalesce(excluded.birthday, existing_customer.birthday)
  returning id into v_customer_id;

  insert into public.orders (
    customer_id, customer_name, customer_phone, zone_id, zone_name_ar, address, items,
    subtotal, delivery_fee, discount, total, coupon_code, fulfillment, delivery_date,
    time_slot, payment_method, receipt_path, notes
  ) values (
    v_customer_id, p_customer_name, p_customer_phone,
    nullif(p_order->>'zoneId', '')::uuid, nullif(p_order->>'zoneNameAr', ''), nullif(p_order->>'address', ''), p_order->'items',
    v_subtotal, v_delivery_fee, v_discount, v_total, nullif(p_order->>'couponCode', ''),
    (p_order->>'fulfillment')::public.fulfillment, nullif(p_order->>'deliveryDate', '')::date,
    nullif(p_order->>'timeSlot', ''), (p_order->>'paymentMethod')::public.payment_method,
    nullif(p_order->>'receiptPath', ''), nullif(p_order->>'notes', '')
  ) returning id into v_order_id;

  insert into public.order_status_history (order_id, status, note)
  values (v_order_id, 'new', 'تم استلام الطلب');
  update public.customers
     set orders_count = orders_count + 1,
         total_spent = total_spent + v_total
   where id = v_customer_id;

  return v_order_id;
end;
$$;
