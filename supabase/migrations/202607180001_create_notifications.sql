-- Generic in-app notifications. Board comments are the first notification source.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  type text not null,
  title text not null,
  body text,
  href text,
  board_post_id uuid references public.board_posts(id) on delete cascade,
  board_comment_id uuid unique references public.board_comments(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_not_blank check (char_length(btrim(type)) > 0),
  constraint notifications_title_not_blank check (char_length(btrim(title)) > 0),
  constraint notifications_href_is_internal check (href is null or href like '/%')
);

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "users read their own notifications"
on public.notifications for select
to authenticated
using (user_id = auth.uid());

create policy "users mark their own notifications as read"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "users delete their own notifications"
on public.notifications for delete
to authenticated
using (user_id = auth.uid());

grant select, update, delete on public.notifications to authenticated;

create or replace function public.notify_board_post_owner_of_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner_id uuid;
  actor_nickname text;
begin
  select user_id into post_owner_id
  from public.board_posts
  where id = new.post_id;

  if post_owner_id is null or post_owner_id = new.user_id then
    return new;
  end if;

  select nickname into actor_nickname
  from public.users
  where id = new.user_id;

  insert into public.notifications (
    user_id,
    actor_user_id,
    type,
    title,
    body,
    href,
    board_post_id,
    board_comment_id
  ) values (
    post_owner_id,
    new.user_id,
    'board_comment',
    '投稿にコメントが届きました',
    coalesce(actor_nickname, 'ユーザー') || 'さんがコメントしました。',
    '/board/' || new.post_id::text,
    new.post_id,
    new.id
  );

  return new;
end;
$$;

create trigger notify_board_post_owner_after_comment
after insert on public.board_comments
for each row execute function public.notify_board_post_owner_of_comment();

comment on table public.notifications is 'Unified in-app notifications for board activity and future features.';

