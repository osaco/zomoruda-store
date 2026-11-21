-- The sequence starts at 1001. Fixed-width lpad truncated numbers after 9999.
alter table public.orders alter column order_number
  set default ('ZM-' || nextval('public.order_number_seq'::regclass)::text);
