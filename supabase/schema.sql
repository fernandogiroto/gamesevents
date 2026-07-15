-- Run this in Supabase SQL Editor to create the events table

create table if not exists public.events (
  id            bigint generated always as identity primary key,
  name          text not null,
  city          text not null,
  state         text not null,
  date          text not null,
  category      text not null,
  accepts_indie boolean default false,
  stand_info    text,
  cost          text,
  audience      text,
  score         integer default 5,
  url           text,
  notes         text,
  source        text default 'static',
  sort_order    integer default 999,
  created_at    timestamptz default now()
);

-- Enable Row Level Security
alter table public.events enable row level security;

-- Anyone can read
create policy "Public read" on public.events
  for select using (true);

-- Anyone can insert (open submissions)
create policy "Public insert" on public.events
  for insert with check (true);

-- Anyone can update
create policy "Public update" on public.events
  for update using (true) with check (true);

-- Anyone can delete
create policy "Public delete" on public.events
  for delete using (true);
