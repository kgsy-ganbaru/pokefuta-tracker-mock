create or replace function public.replace_board_post_selections(target_post_id uuid, offer_ids bigint[], want_ids bigint[])
returns void language plpgsql security invoker set search_path = public as $$
begin
  if not exists (select 1 from public.board_posts where id = target_post_id and user_id = auth.uid()) then raise exception 'Post not owned.'; end if;
  if coalesce(array_length(offer_ids, 1), 0) not between 1 and 10 or coalesce(array_length(want_ids, 1), 0) not between 1 and 10 then raise exception 'Invalid selection count.'; end if;
  if exists (select 1 from unnest(offer_ids) id left join public.ownership o on o.pokefuta_id = id and o.user_id = auth.uid() and o.count > 0 where o.pokefuta_id is null) then raise exception 'Offer is not owned.'; end if;
  delete from public.board_post_offers where post_id = target_post_id;
  delete from public.board_post_wants where post_id = target_post_id;
  insert into public.board_post_offers(post_id, pokefuta_id) select target_post_id, id from unnest(offer_ids) id;
  insert into public.board_post_wants(post_id, pokefuta_id) select target_post_id, id from unnest(want_ids) id;
  update public.board_posts set updated_at = now() where id = target_post_id;
end;
$$;
grant execute on function public.replace_board_post_selections(uuid, bigint[], bigint[]) to authenticated;
