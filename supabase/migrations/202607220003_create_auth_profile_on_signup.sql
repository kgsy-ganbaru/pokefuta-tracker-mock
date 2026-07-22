-- Create the public profile and private login identity in the same transaction
-- as app-initiated Auth signups. The metadata flag keeps legacy/admin-created
-- users and the currently deployed registration flow unchanged.

create or replace function public.create_app_profile_after_auth_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_user_id text;
  requested_nickname text;
begin
  if coalesce((new.raw_user_meta_data ->> 'profile_managed_by_db')::boolean, false) is not true then
    return new;
  end if;

  requested_user_id := btrim(new.raw_user_meta_data ->> 'user_id');
  requested_nickname := btrim(new.raw_user_meta_data ->> 'nickname');

  if requested_user_id is null
    or char_length(requested_user_id) not between 1 and 50
    or requested_user_id like '%@%'
    or requested_user_id ~ '[[:space:]]'
  then
    raise exception 'Invalid user ID.' using errcode = '22023';
  end if;

  if requested_nickname is null or char_length(requested_nickname) not between 1 and 50 then
    raise exception 'Invalid nickname.' using errcode = '22023';
  end if;

  if new.email is null then
    raise exception 'Email is required.' using errcode = '22023';
  end if;

  insert into public.users (id, user_id, nickname)
  values (new.id, requested_user_id, requested_nickname);

  insert into public.login_identities (user_id, login_id, email)
  values (new.id, requested_user_id, lower(new.email));

  return new;
end;
$$;

drop trigger if exists create_app_profile_after_auth_signup on auth.users;
create trigger create_app_profile_after_auth_signup
after insert on auth.users
for each row execute function public.create_app_profile_after_auth_signup();

revoke execute on function public.create_app_profile_after_auth_signup() from public, anon, authenticated;
