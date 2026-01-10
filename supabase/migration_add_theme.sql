-- Migration: Add theme column to profiles table
-- Run this if you already have a profiles table without the theme column

-- Add theme column if it doesn't exist
alter table public.profiles 
add column if not exists theme text default 'light' check (theme in ('light', 'dark'));

-- Update existing profiles to have 'light' as default if null
update public.profiles 
set theme = 'light' 
where theme is null;
