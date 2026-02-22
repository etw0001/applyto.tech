-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create applications table
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null,
  position text not null,
  link text,
  status text not null check (status in ('applied', 'interviewing', 'offered', 'rejected')),
  date_applied date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table for user metadata
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  theme text default 'light' check (theme in ('light', 'dark')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.applications enable row level security;
alter table public.profiles enable row level security;

-- Applications policies: users can only see/edit their own applications
create policy "Users can view their own applications"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own applications"
  on public.applications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own applications"
  on public.applications for delete
  using (auth.uid() = user_id);

-- Profiles policies: users can view/edit their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create function to automatically create profile on user signup
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

-- Create trigger to call function on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger set_updated_at_applications
  before update on public.applications
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Create index for faster queries
create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_date_applied_idx on public.applications(date_applied);

-- Automatically delete all applications when a profile is deleted
create or replace function public.handle_profile_deleted()
returns trigger as $$
begin
  delete from public.applications where user_id = old.id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_profile_deleted
  before delete on public.profiles
  for each row execute function public.handle_profile_deleted();
