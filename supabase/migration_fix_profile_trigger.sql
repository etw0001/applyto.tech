-- Fix the profile creation trigger to handle conflicts and ensure it works
-- This replaces the existing handle_new_user function with better error handling

create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert profile, but handle case where it might already exist
  -- This can happen if the trigger fires multiple times or if profile was created manually
  insert into public.profiles (id, name, email, avatar_url, theme)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'light' -- default theme
  )
  on conflict (id) do update
  set
    name = coalesce(excluded.name, profiles.name),
    email = coalesce(excluded.email, profiles.email),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url);
  
  return new;
exception
  when others then
    -- Log the error but don't fail the user creation
    raise warning 'Error creating profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- Ensure the trigger exists (drop and recreate to be sure)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
