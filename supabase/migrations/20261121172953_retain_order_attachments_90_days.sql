-- This service-only query feeds Storage.remove in the daily Worker.
create index if not exists order_status_history_retention_idx
  on public.order_status_history(order_id, status, created_at desc);

create or replace function public.unclaimed_uploads() returns table(path text)
language sql stable set search_path = '' as $$
  select s.name
  from storage.objects s
  cross join lateral (
    select count(*) as refs,
      count(*) filter (where o.status not in ('delivered','cancelled') or
        coalesce((select max(h.created_at) from public.order_status_history h
                  where h.order_id=o.id and h.status=o.status), 'infinity'::timestamptz)
          > now()-interval '90 days') as protected_refs
    from public.orders o
    where o.receipt_path=s.name or o.items @> jsonb_build_array(jsonb_build_object('photoPath',s.name))
  ) links
  where s.bucket_id='uploads' and s.name ~ '^(photos|receipts)/'
    and s.created_at < now()-interval '3 days' and links.protected_refs=0
    and (links.refs>0 or s.name ~ '^(photos|receipts)/draft/')
  order by s.created_at,s.name limit 500
$$;
revoke all on function public.unclaimed_uploads() from public, anon, authenticated;
grant execute on function public.unclaimed_uploads() to service_role;
