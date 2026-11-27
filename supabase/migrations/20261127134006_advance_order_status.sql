create function public.advance_order_status(p_id uuid, p_expected public.order_status, p_status public.order_status, p_note text, p_by text)
returns uuid language plpgsql set search_path = '' as $$
begin
  perform 1 from public.orders where id=p_id and status=p_expected for update;
  if not found then return null; end if;
  return public.transition_order_status(p_id,p_status,p_note,p_by);
end;
$$;
revoke all on function public.advance_order_status(uuid,public.order_status,public.order_status,text,text) from public,anon,authenticated;
grant execute on function public.advance_order_status(uuid,public.order_status,public.order_status,text,text) to service_role;
