-- Repair CRM aggregates once, then provide an expiry routine for unconfirmed orders.
-- The routine itself enforces the Gaza local time and weekday, so invoking it at any
-- other time (including from a manual SQL console) has no effect.

update public.customers as customer
set orders_count = totals.orders_count,
    total_spent = totals.total_spent
from (
  select customer_id,
         count(*)::integer as orders_count,
         coalesce(sum(total), 0)::numeric as total_spent
  from public.orders
  where status <> 'cancelled'
    and customer_id is not null
  group by customer_id
) as totals
where customer.id = totals.customer_id;

update public.customers as customer
set orders_count = 0,
    total_spent = 0
where not exists (
  select 1 from public.orders
  where customer_id = customer.id and status <> 'cancelled'
);

create or replace function public.expire_unconfirmed_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_local_now timestamp without time zone := now() at time zone 'Asia/Gaza';
  v_day integer;
  v_cutoff timestamp without time zone;
  v_order record;
  v_count integer := 0;
begin
  v_day := extract(isodow from v_local_now)::integer;
  -- Saturday through Thursday, exactly at 20:00 local Gaza time.
  if v_day not in (1, 2, 3, 4, 6) or extract(hour from v_local_now)::integer <> 20
     or extract(minute from v_local_now)::integer <> 0 then
    return 0;
  end if;

  v_cutoff := date_trunc('day', v_local_now) + interval '10 hours';
  for v_order in
    select id
    from public.orders
    where status = 'new'
      and created_at < (v_cutoff at time zone 'Asia/Gaza')
    order by created_at, id
    for update skip locked
  loop
    perform public.transition_order_status(
      v_order.id,
      'cancelled'::public.order_status,
      'إلغاء تلقائي: لم يتم تأكيد الطلب قبل الساعة 10 صباحاً',
      'system'
    );
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.expire_unconfirmed_orders() from public, anon, authenticated;
grant execute on function public.expire_unconfirmed_orders() to service_role;
