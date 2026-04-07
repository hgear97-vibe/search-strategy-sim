-- =============================================
-- Pitch.AI for a Day - Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text not null,
  avatar text not null check (avatar in ('lion', 'horse', 'turtle', 'shark', 'eagle')),
  created_at timestamp with time zone default now()
);

-- 2. Create scores table
create table public.scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  user_satisfaction numeric not null,
  ad_revenue numeric not null,
  composite_score numeric not null,
  rating text not null,
  fired boolean default false,
  created_at timestamp with time zone default now()
);

-- 3. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.scores enable row level security;

-- 4. RLS policies for profiles
-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can create own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. RLS policies for scores
-- Users can read their own scores
create policy "Users can view own scores"
  on public.scores for select
  using (auth.uid() = user_id);

-- Users can insert their own scores
create policy "Users can create own scores"
  on public.scores for insert
  with check (auth.uid() = user_id);

-- 6. Create index for faster score lookups
create index idx_scores_user_id on public.scores(user_id);
create index idx_scores_created_at on public.scores(created_at desc);
