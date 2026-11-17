-- Product-level customization, gift-box builder settings, and atomic inventory.
alter table public.products
  add column if not exists name_required boolean not null default false,
  add column if not exists name_price numeric(10,2) not null default 0 check (name_price >= 0),
  add column if not exists card_message_required boolean not null default false,
  add column if not exists card_message_price numeric(10,2) not null default 0 check (card_message_price >= 0),
  add column if not exists photo_required boolean not null default false,
  add column if not exists photo_price numeric(10,2) not null default 0 check (photo_price >= 0),
  add column if not exists is_gift_box boolean not null default false,
  add column if not exists gift_box_capacity integer,
  add column if not exists allow_in_gift_box boolean not null default false;

alter table public.products
  add constraint products_gift_box_capacity_check
    check (gift_box_capacity is null or gift_box_capacity between 1 and 100),
  add constraint products_gift_box_type_check
    check (not is_gift_box or gift_box_capacity is not null);

create index if not exists products_gift_box_idx
  on public.products (is_active, allow_in_gift_box)
  where allow_in_gift_box;

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
  v_customization_sum numeric;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_delivery_fee numeric := 0;
  v_discount numeric := 0;
  v_raw_discount numeric := 0;
  v_total numeric;
  v_quantity integer;
  v_group_key text;
  v_box_id uuid;
  v_box_capacity integer;
  v_box_units integer;
  v_box_count integer;
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

  if exists (
    select 1 from jsonb_array_elements(p_order->'items') as entry(value)
    where coalesce((entry.value->>'isGiftBox')::boolean, false)
      and nullif(entry.value->>'giftBoxKey', '') is null
  ) then raise exception 'CHECKOUT_CONFLICT'; end if;

  -- Lock all SKUs in a stable order so inventory and product configuration
  -- stay fixed while prices, box capacity, and eligibility are checked.
  for v_product_id in
    select distinct (entry.value->>'productId')::uuid
    from jsonb_array_elements(p_order->'items') as entry(value)
    order by 1
  loop
    select * into v_product from public.products where id = v_product_id for update;
    if not found or not v_product.is_active then raise exception 'CHECKOUT_CONFLICT'; end if;
  end loop;

  -- Validate each composed box and its contents before reserving any stock.
  for v_group_key in
    select distinct entry.value->>'giftBoxKey'
    from jsonb_array_elements(p_order->'items') as entry(value)
    where nullif(entry.value->>'giftBoxKey', '') is not null
  loop
    select count(*) into v_box_count
    from jsonb_array_elements(p_order->'items') as entry(value)
    join public.products box_product on box_product.id = (entry.value->>'productId')::uuid
    where entry.value->>'giftBoxKey' = v_group_key
      and nullif(entry.value->>'giftBoxId', '') is null
      and box_product.is_gift_box;
    if v_box_count <> 1 then raise exception 'CHECKOUT_CONFLICT'; end if;

    select box_product.id, box_product.gift_box_capacity
      into v_box_id, v_box_capacity
    from jsonb_array_elements(p_order->'items') as entry(value)
    join public.products box_product on box_product.id = (entry.value->>'productId')::uuid
    where entry.value->>'giftBoxKey' = v_group_key
      and nullif(entry.value->>'giftBoxId', '') is null
      and box_product.is_gift_box;

    select coalesce(sum((entry.value->>'quantity')::integer), 0)::integer, count(*)::integer
      into v_box_units, v_box_count
    from jsonb_array_elements(p_order->'items') as entry(value)
    where entry.value->>'giftBoxKey' = v_group_key
      and (entry.value->>'giftBoxId')::uuid = v_box_id;
    if v_box_count < 1 or v_box_units < 1 or v_box_units > v_box_capacity then
      raise exception 'CHECKOUT_CONFLICT';
    end if;

    if exists (
      select 1
      from jsonb_array_elements(p_order->'items') as entry(value)
      left join public.products content_product on content_product.id = (entry.value->>'productId')::uuid
      where entry.value->>'giftBoxKey' = v_group_key
        and (entry.value->>'giftBoxId')::uuid = v_box_id
        and (content_product.id is null or not content_product.allow_in_gift_box or content_product.is_gift_box)
    ) then raise exception 'CHECKOUT_CONFLICT'; end if;

    if exists (
      select 1 from jsonb_array_elements(p_order->'items') as entry(value)
      where entry.value->>'giftBoxKey' = v_group_key
        and entry.value->>'productId' <> v_box_id::text
        and coalesce(entry.value->>'giftBoxId', '') <> v_box_id::text
    ) then raise exception 'CHECKOUT_CONFLICT'; end if;
  end loop;

  if exists (
    select 1 from jsonb_array_elements(p_order->'items') as entry(value)
    where nullif(entry.value->>'giftBoxId', '') is not null
      and nullif(entry.value->>'giftBoxKey', '') is null
  ) then raise exception 'CHECKOUT_CONFLICT'; end if;

  -- Lock each SKU once in a stable order; boxes and contents share this transaction.
  for v_product_id in
    select distinct (entry.value->>'productId')::uuid
    from jsonb_array_elements(p_order->'items') as entry(value)
    order by 1
  loop
    select * into v_product from public.products where id = v_product_id for update;
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

  -- Reprice every line and customization using locked product data.
  for v_item in select entry.value from jsonb_array_elements(p_order->'items') as entry(value)
  loop
    v_product_id := (v_item->>'productId')::uuid;
    select * into v_product from public.products where id = v_product_id;
    if v_product.price <> (v_item->>'price')::numeric
       or coalesce((v_item->>'isGiftBox')::boolean, false) <> v_product.is_gift_box then
      raise exception 'CHECKOUT_CONFLICT';
    end if;

    if exists (
      select 1 from public.product_options required_option
      where required_option.product_id = v_product_id and required_option.is_required
        and not exists (
          select 1 from jsonb_array_elements(coalesce(v_item->'options', '[]'::jsonb)) as picked(value)
          where picked.value->>'nameAr' = required_option.name_ar
        )
    ) then raise exception 'CHECKOUT_CONFLICT'; end if;

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

    if (v_product.name_required and nullif(trim(coalesce(v_item->>'customName', '')), '') is null)
       or (not v_product.allow_name and nullif(trim(coalesce(v_item->>'customName', '')), '') is not null)
       or (v_product.card_message_required and nullif(trim(coalesce(v_item->>'cardMessage', '')), '') is null)
       or (not v_product.allow_card_message and nullif(trim(coalesce(v_item->>'cardMessage', '')), '') is not null)
       or (v_product.photo_required and nullif(v_item->>'photoPath', '') is null)
       or (not v_product.allow_photo_upload and nullif(v_item->>'photoPath', '') is not null) then
      raise exception 'CHECKOUT_CONFLICT';
    end if;

    v_customization_sum := 0;
    if nullif(trim(coalesce(v_item->>'customName', '')), '') is not null then v_customization_sum := v_customization_sum + v_product.name_price; end if;
    if nullif(trim(coalesce(v_item->>'cardMessage', '')), '') is not null then v_customization_sum := v_customization_sum + v_product.card_message_price; end if;
    if nullif(v_item->>'photoPath', '') is not null then v_customization_sum := v_customization_sum + v_product.photo_price; end if;
    if coalesce((v_item->>'nameFee')::numeric, 0) <> (case when nullif(trim(coalesce(v_item->>'customName', '')), '') is not null then v_product.name_price else 0 end)
       or coalesce((v_item->>'cardMessageFee')::numeric, 0) <> (case when nullif(trim(coalesce(v_item->>'cardMessage', '')), '') is not null then v_product.card_message_price else 0 end)
       or coalesce((v_item->>'photoFee')::numeric, 0) <> (case when nullif(v_item->>'photoPath', '') is not null then v_product.photo_price else 0 end) then
      raise exception 'CHECKOUT_CONFLICT';
    end if;

    v_quantity := (v_item->>'quantity')::integer;
    v_line_total := round(greatest(0, v_product.price + v_delta_sum + v_customization_sum) * v_quantity, 2);
    if v_quantity < 1 or v_quantity > 50 or v_line_total <> (v_item->>'lineTotal')::numeric then
      raise exception 'CHECKOUT_CONFLICT';
    end if;
    v_subtotal := v_subtotal + v_line_total;
  end loop;
  v_subtotal := round(v_subtotal, 2);
  if v_subtotal <> (p_order->>'subtotal')::numeric then raise exception 'CHECKOUT_CONFLICT'; end if;

  if p_order->>'fulfillment' = 'delivery' then
    select * into v_zone from public.delivery_zones where id = (p_order->>'zoneId')::uuid for share;
    if not found or not v_zone.is_active
       or (v_zone.min_order is not null and v_subtotal < v_zone.min_order) then raise exception 'CHECKOUT_CONFLICT'; end if;
    v_delivery_fee := v_zone.fee;
  elsif p_order->>'fulfillment' <> 'pickup' then
    raise exception 'CHECKOUT_CONFLICT';
  end if;
  if v_delivery_fee <> (p_order->>'deliveryFee')::numeric then raise exception 'CHECKOUT_CONFLICT'; end if;

  if p_coupon_id is not null then
    select * into v_coupon from public.coupons where id = p_coupon_id for update;
    if not found or not v_coupon.is_active
       or (v_coupon.starts_at is not null and v_coupon.starts_at > v_now)
       or (v_coupon.ends_at is not null and v_coupon.ends_at < v_now)
       or (v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit)
       or (v_coupon.min_order is not null and v_subtotal < v_coupon.min_order)
       or v_coupon.code <> p_order->>'couponCode' then raise exception 'CHECKOUT_CONFLICT'; end if;
    v_raw_discount := case when v_coupon.type = 'fixed' then v_coupon.value else v_subtotal * v_coupon.value / 100 end;
    v_discount := round(least(v_subtotal, least(v_raw_discount, coalesce(v_coupon.max_discount, v_raw_discount))), 2);
    if v_discount <> (p_order->>'discount')::numeric then raise exception 'CHECKOUT_CONFLICT'; end if;
    update public.coupons set used_count = used_count + 1 where id = p_coupon_id;
  elsif coalesce(p_order->>'couponCode', '') <> '' or (p_order->>'discount')::numeric <> 0 then
    raise exception 'CHECKOUT_CONFLICT';
  end if;

  v_total := round(greatest(0, v_subtotal + v_delivery_fee - v_discount), 2);
  if v_total <> (p_order->>'total')::numeric
     or p_customer_name <> p_order->>'customerName'
     or p_customer_phone <> p_order->>'customerPhone' then raise exception 'CHECKOUT_CONFLICT'; end if;

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

  insert into public.order_status_history (order_id, status, note) values (v_order_id, 'new', 'تم استلام الطلب');
  update public.customers set orders_count = orders_count + 1, total_spent = total_spent + v_total where id = v_customer_id;
  return v_order_id;
end;
$$;
