-- Secure the legacy public schema without changing its public read behaviour.

alter table public.difficulty_master enable row level security;
alter table public.pokefuta enable row level security;
alter table public.pokefuta_pokemon enable row level security;
alter table public.users enable row level security;
alter table public.ownership enable row level security;

drop policy if exists "difficulty is publicly readable" on public.difficulty_master;
create policy "difficulty is publicly readable"
on public.difficulty_master for select using (true);

drop policy if exists "pokefuta are publicly readable" on public.pokefuta;
create policy "pokefuta are publicly readable"
on public.pokefuta for select using (true);

drop policy if exists "pokefuta pokemon are publicly readable" on public.pokefuta_pokemon;
create policy "pokefuta pokemon are publicly readable"
on public.pokefuta_pokemon for select using (true);

drop policy if exists "user profiles are publicly readable" on public.users;
create policy "user profiles are publicly readable"
on public.users for select using (true);

drop policy if exists "users update their own profile" on public.users;
create policy "users update their own profile"
on public.users for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "ownership is publicly readable" on public.ownership;
create policy "ownership is publicly readable"
on public.ownership for select using (true);

drop policy if exists "users insert their own ownership" on public.ownership;
create policy "users insert their own ownership"
on public.ownership for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "users update their own ownership" on public.ownership;
create policy "users update their own ownership"
on public.ownership for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "users delete their own ownership" on public.ownership;
create policy "users delete their own ownership"
on public.ownership for delete to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.difficulty_master from anon, authenticated;
revoke all on table public.pokefuta from anon, authenticated;
revoke all on table public.pokefuta_pokemon from anon, authenticated;
revoke all on table public.users from anon, authenticated;
revoke all on table public.ownership from anon, authenticated;

grant select on table public.difficulty_master to anon, authenticated;
grant select on table public.pokefuta to anon, authenticated;
grant select on table public.pokefuta_pokemon to anon, authenticated;
grant select (id, user_id, nickname, created_at, updated_at, comment, friend_code)
  on table public.users to anon, authenticated;
grant update (nickname, comment, friend_code, updated_at)
  on table public.users to authenticated;
grant select on table public.ownership to anon, authenticated;
grant insert, update, delete on table public.ownership to authenticated;

-- Normalize grants on feature tables that were created while the permissive
-- legacy default privileges were still active.
revoke all on table public.board_posts from anon, authenticated;
revoke all on table public.board_post_offers from anon, authenticated;
revoke all on table public.board_post_wants from anon, authenticated;
revoke all on table public.board_comments from anon, authenticated;
revoke all on table public.notifications from anon, authenticated;

grant select on table public.board_posts to anon, authenticated;
grant select on table public.board_post_offers to anon, authenticated;
grant select on table public.board_post_wants to anon, authenticated;
grant select on table public.board_comments to anon, authenticated;
grant insert, update, delete on table public.board_posts to authenticated;
grant insert, delete on table public.board_post_offers to authenticated;
grant insert, delete on table public.board_post_wants to authenticated;
grant insert, delete on table public.board_comments to authenticated;
grant select, delete on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;

-- Email addresses stay private. Authenticated users can only read their own row
-- through the policy created with the login_identities table.
revoke all on table public.login_identities from anon, authenticated;
grant select on table public.login_identities to authenticated;

-- Backfill accounts that were created before login_identities existed.
insert into public.login_identities (user_id, login_id, email)
select u.id, u.user_id, lower(au.email)
from public.users u
join auth.users au on au.id = u.id
where au.email is not null
on conflict (user_id) do update
set login_id = excluded.login_id,
    email = excluded.email,
    updated_at = now();

-- The original schema granted every new object to browser-facing roles.
-- New migrations must grant only the operations their feature needs.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;

revoke all on sequence public.users_id_seq from anon, authenticated;
revoke all on sequence public.pokefuta_id_seq from anon, authenticated;

revoke execute on function public.enforce_board_offer_limit() from public, anon, authenticated;
revoke execute on function public.enforce_board_want_limit() from public, anon, authenticated;
revoke execute on function public.enforce_owned_board_offer() from public, anon, authenticated;
revoke execute on function public.set_board_post_updated_at() from public, anon, authenticated;
revoke execute on function public.notify_board_post_owner_of_comment() from public, anon, authenticated;
revoke execute on function public.replace_board_post_selections(uuid, bigint[], bigint[]) from public, anon;
grant execute on function public.replace_board_post_selections(uuid, bigint[], bigint[]) to authenticated;
