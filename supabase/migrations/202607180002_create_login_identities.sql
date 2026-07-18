-- Private user ID to email mapping used for email-based authentication.
-- No client role receives direct access because email addresses are private.

create table public.login_identities (
  user_id uuid primary key references public.users(id) on delete cascade,
  login_id text not null unique,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint login_identities_login_id_not_blank check (char_length(btrim(login_id)) > 0),
  constraint login_identities_email_normalized check (email = lower(btrim(email)))
);

alter table public.login_identities enable row level security;

-- Authenticated users may only confirm the address attached to their own session.
create policy "users read their own login identity"
on public.login_identities for select
to authenticated
using (user_id = auth.uid());

grant select on public.login_identities to authenticated;

comment on table public.login_identities is 'Private mapping between public user IDs and Supabase Auth email addresses. Writes use the service role.';

