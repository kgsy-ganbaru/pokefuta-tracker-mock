-- Pokefuta exchange board schema.
-- Apply this migration after the existing public.users, public.pokefuta,
-- and public.ownership tables have been created.

create table public.board_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  comment text,
  expires_at timestamptz not null default (now() + interval '7 days'),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_posts_comment_length
    check (comment is null or char_length(comment) <= 200),
  constraint board_posts_expiry_after_creation
    check (expires_at > created_at)
);

create table public.board_post_offers (
  post_id uuid not null references public.board_posts(id) on delete cascade,
  pokefuta_id bigint not null references public.pokefuta(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, pokefuta_id)
);

create table public.board_post_wants (
  post_id uuid not null references public.board_posts(id) on delete cascade,
  pokefuta_id bigint not null references public.pokefuta(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, pokefuta_id)
);

create table public.board_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.board_posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint board_comments_body_length
    check (char_length(btrim(body)) between 1 and 200)
);

create index board_posts_active_order_idx
  on public.board_posts (closed_at, expires_at desc, updated_at desc);
create index board_posts_user_order_idx
  on public.board_posts (user_id, updated_at desc);
create index board_post_offers_pokefuta_idx
  on public.board_post_offers (pokefuta_id, post_id);
create index board_post_wants_pokefuta_idx
  on public.board_post_wants (pokefuta_id, post_id);
create index board_comments_post_order_idx
  on public.board_comments (post_id, created_at asc);

create or replace function public.set_board_post_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_board_post_updated_at
before update on public.board_posts
for each row execute function public.set_board_post_updated_at();

create or replace function public.enforce_board_offer_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select count(*) from public.board_post_offers where post_id = new.post_id) >= 10 then
    raise exception 'A board post can contain at most 10 offers.';
  end if;
  return new;
end;
$$;

create trigger enforce_board_offer_limit
before insert on public.board_post_offers
for each row execute function public.enforce_board_offer_limit();

create or replace function public.enforce_board_want_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select count(*) from public.board_post_wants where post_id = new.post_id) >= 10 then
    raise exception 'A board post can contain at most 10 wants.';
  end if;
  return new;
end;
$$;

create trigger enforce_board_want_limit
before insert on public.board_post_wants
for each row execute function public.enforce_board_want_limit();

create or replace function public.enforce_owned_board_offer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner uuid;
begin
  select user_id into post_owner
  from public.board_posts
  where id = new.post_id;

  if post_owner is null or not exists (
    select 1
    from public.ownership
    where user_id = post_owner
      and pokefuta_id = new.pokefuta_id
      and count > 0
  ) then
    raise exception 'Only owned Pokefuta can be offered.';
  end if;

  return new;
end;
$$;

create trigger enforce_owned_board_offer
before insert or update on public.board_post_offers
for each row execute function public.enforce_owned_board_offer();

alter table public.board_posts enable row level security;
alter table public.board_post_offers enable row level security;
alter table public.board_post_wants enable row level security;
alter table public.board_comments enable row level security;

create policy "board posts are publicly readable"
on public.board_posts for select
using (true);

create policy "authenticated users create their own board posts"
on public.board_posts for insert
to authenticated
with check (user_id = auth.uid());

create policy "owners update their own board posts"
on public.board_posts for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "owners delete their own board posts"
on public.board_posts for delete
to authenticated
using (user_id = auth.uid());

create policy "board offers are publicly readable"
on public.board_post_offers for select
using (true);

create policy "owners add offers to their posts"
on public.board_post_offers for insert
to authenticated
with check (
  exists (
    select 1 from public.board_posts
    where id = post_id and user_id = auth.uid()
  )
  and exists (
    select 1 from public.ownership
    where user_id = auth.uid()
      and pokefuta_id = board_post_offers.pokefuta_id
      and count > 0
  )
);

create policy "owners delete offers from their posts"
on public.board_post_offers for delete
to authenticated
using (
  exists (
    select 1 from public.board_posts
    where id = post_id and user_id = auth.uid()
  )
);

create policy "board wants are publicly readable"
on public.board_post_wants for select
using (true);

create policy "owners add wants to their posts"
on public.board_post_wants for insert
to authenticated
with check (
  exists (
    select 1 from public.board_posts
    where id = post_id and user_id = auth.uid()
  )
);

create policy "owners delete wants from their posts"
on public.board_post_wants for delete
to authenticated
using (
  exists (
    select 1 from public.board_posts
    where id = post_id and user_id = auth.uid()
  )
);

create policy "board comments are publicly readable"
on public.board_comments for select
using (true);

create policy "authenticated users create their own comments"
on public.board_comments for insert
to authenticated
with check (user_id = auth.uid());

create policy "comment authors delete their own comments"
on public.board_comments for delete
to authenticated
using (user_id = auth.uid());

grant select on public.board_posts to anon, authenticated;
grant select on public.board_post_offers to anon, authenticated;
grant select on public.board_post_wants to anon, authenticated;
grant select on public.board_comments to anon, authenticated;

grant insert, update, delete on public.board_posts to authenticated;
grant insert, delete on public.board_post_offers to authenticated;
grant insert, delete on public.board_post_wants to authenticated;
grant insert, delete on public.board_comments to authenticated;

comment on table public.board_posts is 'Pokefuta exchange board posts. Active posts have closed_at null and expires_at greater than now().';
comment on table public.board_post_offers is 'Pokefuta types offered by a board post; maximum 10 and ownership required.';
comment on table public.board_post_wants is 'Pokefuta types wanted by a board post; maximum 10.';
comment on table public.board_comments is 'Comments on board posts; body length is 1 to 200 characters.';
