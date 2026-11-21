alter table public.products add column gift_box_product_ids uuid[];
alter table public.orders add column checkout_key text unique;

create function public.save_catalog_product(p_id uuid, p_product jsonb, p_images jsonb, p_options jsonb, p_occasions uuid[])
returns uuid language plpgsql set search_path = '' as $$
declare
  item public.products := jsonb_populate_record(null::public.products, p_product);
  saved uuid;
begin
  if item.gift_box_product_ids is not null and (
    not item.is_gift_box or cardinality(item.gift_box_product_ids) = 0 or exists (
      select 1 from unnest(item.gift_box_product_ids) x where not exists
        (select 1 from public.products p where p.id = x and p.allow_in_gift_box and not p.is_gift_box)
    )
  ) then raise exception 'Invalid gift box contents'; end if;
  if p_id is null then
    insert into public.products (name_ar, slug, description_ar, price, compare_at_price, category_id, stock_qty, availability, is_featured, is_new, is_active, allow_name, name_required, name_price, allow_card_message, card_message_required, card_message_price, allow_photo_upload, photo_required, photo_price, is_gift_box, gift_box_capacity, gift_box_product_ids, allow_in_gift_box)
    values (item.name_ar, item.slug, item.description_ar, item.price, item.compare_at_price, item.category_id, item.stock_qty, item.availability, item.is_featured, item.is_new, item.is_active, item.allow_name, item.name_required, item.name_price, item.allow_card_message, item.card_message_required, item.card_message_price, item.allow_photo_upload, item.photo_required, item.photo_price, item.is_gift_box, item.gift_box_capacity, item.gift_box_product_ids, item.allow_in_gift_box) returning id into saved;
  else
    update public.products set
      name_ar = item.name_ar,
      slug = item.slug,
      description_ar = item.description_ar,
      price = item.price,
      compare_at_price = item.compare_at_price,
      category_id = item.category_id,
      stock_qty = item.stock_qty,
      availability = item.availability,
      is_featured = item.is_featured,
      is_new = item.is_new,
      is_active = item.is_active,
      allow_name = item.allow_name,
      name_required = item.name_required,
      name_price = item.name_price,
      allow_card_message = item.allow_card_message,
      card_message_required = item.card_message_required,
      card_message_price = item.card_message_price,
      allow_photo_upload = item.allow_photo_upload,
      photo_required = item.photo_required,
      photo_price = item.photo_price,
      is_gift_box = item.is_gift_box,
      gift_box_capacity = item.gift_box_capacity,
      gift_box_product_ids = item.gift_box_product_ids,
      allow_in_gift_box = item.allow_in_gift_box
    where id = p_id returning id into saved;
    if saved is null then return null; end if;
    delete from public.product_images where product_id = saved;
    delete from public.product_options where product_id = saved;
    delete from public.product_occasions where product_id = saved;
  end if;
  insert into public.product_images(product_id,url,alt_ar,sort_order,is_primary)
    select saved, x->>'url', x->>'altAr', n-1, n=1 from jsonb_array_elements(p_images) with ordinality a(x,n);
  insert into public.product_options(product_id,name_ar,is_required,sort_order,values)
    select saved,x->>'nameAr',(x->>'isRequired')::boolean,n-1,
      (select jsonb_agg(jsonb_build_object('value_ar',v->>'valueAr','price_delta',v->'priceDelta') order by idx)
       from jsonb_array_elements(x->'values') with ordinality v(v,idx))
    from jsonb_array_elements(p_options) with ordinality a(x,n);
  insert into public.product_occasions(product_id,occasion_id) select saved,unnest(p_occasions);
  return saved;
end $$;
revoke all on function public.save_catalog_product(uuid,jsonb,jsonb,jsonb,uuid[]) from public, anon, authenticated;
grant execute on function public.save_catalog_product(uuid,jsonb,jsonb,jsonb,uuid[]) to service_role;

create function public.submit_checkout(p_key text, p_order jsonb, p_customer_name text, p_customer_phone text, p_birthday date, p_coupon_id uuid)
returns uuid language plpgsql set search_path = '' as $$
declare
  saved uuid;
  attachment text;
begin
  if p_key is null or length(p_key) < 32 then raise exception 'Missing checkout key'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_key,0));
  select id into saved from public.orders where checkout_key=p_key;
  if saved is not null then return saved; end if;
  for attachment in select p_order->>'receiptPath' union select i->>'photoPath' from jsonb_array_elements(p_order->'items') i loop
    if attachment is not null and not exists(select 1 from storage.objects where bucket_id='uploads' and name=attachment and created_at > now()-interval '2 days') then
      raise exception 'ATTACHMENT_EXPIRED';
    end if;
  end loop;
  if exists(select 1 from jsonb_array_elements(p_order->'items') i join public.products box on box.id=(i->>'giftBoxId')::uuid
    where box.gift_box_product_ids is not null and not ((i->>'productId')::uuid = any(box.gift_box_product_ids))) then
    raise exception 'CHECKOUT_CONFLICT';
  end if;
  saved := public.place_checkout_order(p_order,p_customer_name,p_customer_phone,p_birthday,p_coupon_id);
  update public.orders set checkout_key=p_key where id=saved;
  return saved;
end $$;
revoke all on function public.submit_checkout(text,jsonb,text,text,date,uuid) from public,anon,authenticated;
grant execute on function public.submit_checkout(text,jsonb,text,text,date,uuid) to service_role;

create index if not exists orders_receipt_path_idx on public.orders(receipt_path) where receipt_path is not null;
create index if not exists orders_items_path_idx on public.orders using gin(items jsonb_path_ops);
create function public.unclaimed_uploads() returns table(path text)
language sql stable set search_path = '' as $$
  select s.name from storage.objects s where s.bucket_id='uploads'
    and s.name ~ '^(photos|receipts)/draft/' and s.created_at < now()-interval '3 days'
    and not exists(select 1 from public.orders o where o.receipt_path=s.name)
    and not exists(select 1 from public.orders o where o.items @> jsonb_build_array(jsonb_build_object('photoPath',s.name)))
  order by s.created_at limit 500
$$;
revoke all on function public.unclaimed_uploads() from public, anon, authenticated;
grant execute on function public.unclaimed_uploads() to service_role;

create function public.store_sales_summary(p_days integer) returns jsonb
language sql stable set search_path = '' as $$
  with bounds as (
    select greatest(1,least(365,p_days)) as days, (now() at time zone 'Asia/Gaza')::date today
  ), recent as materialized (
    select o.id,o.total,o.items,o.status,o.created_at from public.orders o,bounds b
    where o.created_at >= ((b.today-b.days+1)::timestamp at time zone 'Asia/Gaza')
  ), sales as (select * from recent where status <> 'cancelled'),
  daily as (select (created_at at time zone 'Asia/Gaza')::date as sale_day,sum(total) revenue,count(*) orders from sales group by 1),
  points as (select b.today-i as sale_day from bounds b,generate_series(0,b.days-1) i),
  top_items as (
    select item->>'productId' as "productId", (array_agg(item->>'nameAr' order by created_at desc,id))[1] as "nameAr",
      sum((item->>'quantity')::integer) quantity, sum((item->>'lineTotal')::numeric) revenue
    from sales cross join lateral jsonb_array_elements(items) item
    group by item->>'productId' order by revenue desc, "productId" limit 10
  ) select jsonb_build_object(
    'revenue',coalesce(sum(total),0),'orders',count(*),'averageOrder',coalesce(round(avg(total),2),0),
    'byDay',(select jsonb_agg(jsonb_build_object('day',p.sale_day,'revenue',coalesce(d.revenue,0),'orders',coalesce(d.orders,0)) order by p.sale_day) from points p left join daily d using(sale_day)),
    'topProducts',coalesce((select jsonb_agg(to_jsonb(t) order by t.revenue desc,t."productId") from top_items t),'[]'::jsonb),
    'byStatus',(select jsonb_object_agg(st,coalesce(n,0)) from unnest(enum_range(null::public.order_status)) st left join (select status,count(*) n from recent group by status) counts on counts.status=st)
  ) from sales
$$;
revoke all on function public.store_sales_summary(integer) from public,anon,authenticated;
grant execute on function public.store_sales_summary(integer) to service_role;
