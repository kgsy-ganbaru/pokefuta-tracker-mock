-- Keep user-ID login working after an Auth email change is confirmed.

create or replace function public.sync_login_identity_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email and new.email is not null then
    update public.login_identities
    set email = lower(new.email),
        updated_at = now()
    where user_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_login_identity_email_after_auth_update on auth.users;
create trigger sync_login_identity_email_after_auth_update
after update of email on auth.users
for each row execute function public.sync_login_identity_email();

revoke execute on function public.sync_login_identity_email() from public, anon, authenticated;
