-- Existing Pokefuta rows were imported with explicit IDs, leaving the
-- auto-increment sequence behind the actual maximum ID.
do $$
declare
  sequence_name text;
  next_id bigint;
begin
  sequence_name := pg_get_serial_sequence('public.pokefuta', 'id');

  if sequence_name is null then
    raise exception 'No sequence is associated with public.pokefuta.id';
  end if;

  select coalesce(max(id), 0) + 1
    into next_id
    from public.pokefuta;

  perform setval(sequence_name, next_id, false);
end
$$;
