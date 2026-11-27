create function public.confirm_new_customer_order(p_id uuid)
returns uuid language plpgsql set search_path = '' as $$
declare
  current_status public.order_status;
begin
  select status into current_status from public.orders where id = p_id for update;
  if not found then return null; end if;
  if current_status = 'new' then
    return public.transition_order_status(p_id, 'confirmed', 'Customer confirmed the order', 'customer');
  end if;
  return p_id;
end $$;
revoke all on function public.confirm_new_customer_order(uuid) from public, anon, authenticated;
grant execute on function public.confirm_new_customer_order(uuid) to service_role;
