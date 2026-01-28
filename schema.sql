-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create specific types for dropdowns
create type bank_provider as enum ('Agricola', 'Davivienda', 'Promerica', 'Atlantida');
create type card_tier as enum ('Platinum', 'ONE', 'Classic', 'Gold', 'Black', 'Infinite');
create type transaction_type as enum ('purchase', 'sale', 'expense');

-- 1. Profiles (Public profile mapped to auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. Credit Cards
create table public.cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  bank bank_provider not null,
  tier card_tier not null,
  credit_limit numeric(12,2) not null,
  cutoff_day int not null check (cutoff_day between 1 and 31),
  payment_day int not null check (payment_day between 1 and 31),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.cards enable row level security;

create policy "Users can CRUD their own cards"
  on cards for all
  using ( auth.uid() = user_id );

-- 3. Loans (Prestamos)
create table public.loans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null, -- e.g. "Prestamo 1"
  principal_amount numeric(12,2) not null,
  monthly_quota numeric(12,2) not null,
  current_balance numeric(12,2) not null,
  start_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.loans enable row level security;

create policy "Users can CRUD their own loans"
  on loans for all
  using ( auth.uid() = user_id );

-- 4. Business Transactions (Granos & Activos)
create table public.transactions_granos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type transaction_type not null,
  
  -- Details for Purchases/Sales
  quantity_quintales numeric(10,2), -- Cantidad en quintales
  price_per_quintal numeric(12,2),
  
  -- Details for Logistics/Expenses
  fuel_cost numeric(12,2) default 0,
  freight_cost numeric(12,2) default 0,
  other_cost numeric(12,2) default 0,
  
  -- General
  total_amount numeric(12,2) not null, -- Calculated or input total
  location text,
  transaction_date date default current_date,
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions_granos enable row level security;

create policy "Users can CRUD their own business transactions"
  on transactions_granos for all
  using ( auth.uid() = user_id );

-- 5. Rentals (Alquiler de Terreno)
create table public.rentals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  description text not null,
  amount numeric(12,2) not null,
  rental_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.rentals enable row level security;

create policy "Users can CRUD their own rentals"
  on rentals for all
  using ( auth.uid() = user_id );

-- Helper to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
