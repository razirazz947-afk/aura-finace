-- ============================================================
-- AURA FINANCE — SUPABASE DATABASE SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Profiles (linked to Supabase Auth users)
create table if not exists profiles (
  id    uuid references auth.users(id) on delete cascade primary key,
  name  text not null default 'User',
  email text
);
alter table profiles enable row level security;
create policy "Own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. Accounts
create table if not exists accounts (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  type       text not null default 'Checking',
  bank       text,
  balance    numeric not null default 0,
  number     text default '',
  color      text default '#6366F1',
  change     numeric default 0,
  created_at timestamptz default now()
);
alter table accounts enable row level security;
create policy "Own accounts" on accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Transactions
create table if not exists transactions (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  amount     numeric not null,
  type       text not null default 'debit',
  category   text not null default 'Other',
  account_id uuid references accounts(id) on delete set null,
  date       date not null default current_date,
  icon       text default '💳',
  note       text default '',
  recurring  boolean default false,
  created_at timestamptz default now()
);
alter table transactions enable row level security;
create policy "Own transactions" on transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Budgets
create table if not exists budgets (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  limit_amount numeric not null default 500,
  color        text default '#8083ff',
  icon         text default '🛒',
  category     text default 'Essential',
  created_at   timestamptz default now()
);
alter table budgets enable row level security;
create policy "Own budgets" on budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
