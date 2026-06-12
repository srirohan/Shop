-- ============================================
-- SHREE COLLECTIONS - Supabase Schema
-- Ye SQL Supabase Dashboard > SQL Editor mein chalayein
-- ============================================

-- 1. Categories Table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamp with time zone default now()
);

-- 2. Items Table
create table if not exists items (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id) on delete cascade not null,
  name text not null,
  image_url text not null,
  created_at timestamp with time zone default now()
);

-- 3. RLS (Row Level Security) Enable
alter table categories enable row level security;
alter table items enable row level security;

-- 4. Public read policies (user side - koi bhi dekh sakta hai)
create policy "Public can read categories"
  on categories for select
  using (true);

create policy "Public can read items"
  on items for select
  using (true);

-- 5. Authenticated (admin) write policies
create policy "Admin can insert categories"
  on categories for insert
  to authenticated
  with check (true);

create policy "Admin can update categories"
  on categories for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin can delete categories"
  on categories for delete
  to authenticated
  using (true);

create policy "Admin can insert items"
  on items for insert
  to authenticated
  with check (true);

create policy "Admin can update items"
  on items for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin can delete items"
  on items for delete
  to authenticated
  using (true);

-- ============================================
-- 6. Storage Bucket Setup
-- Supabase Dashboard > Storage > New Bucket
--   Name: images
--   Public: YES (checkbox on karo)
-- ============================================

-- Storage policies (SQL Editor mein chalayein)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "Public can view images"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "Authenticated can upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'images');

create policy "Authenticated can delete images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'images');

-- ============================================
-- 7. Default 4 Categories Insert (optional)
-- ============================================
insert into categories (name, slug) values
  ('Lady Purse', 'lady-purse'),
  ('Ladies Suit', 'ladies-suit'),
  ('Home Decor', 'home-decor'),
  ('Hair Accessories', 'hair-accessories')
on conflict (slug) do nothing;
