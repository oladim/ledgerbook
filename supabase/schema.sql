-- ============================================================================
-- Ledgerbook schema for Supabase — run this in the Supabase SQL editor.
-- Creates tables, Row-Level Security, and a trigger that gives every new
-- (Google) user their own workspace automatically.
-- ============================================================================

-- ---------- tables ----------
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Business',
  mark text default 'MB',
  address text, phone text, email text, rc text, tin text,
  bank_name text, bank_acct_name text, bank_acct_no text,
  terms text default 'Payment due within 7 days.',
  thanks text default 'Thank you for your business!',
  accent1 text default '#0090fc', accent2 text default '#0072d6',
  logo_url text, signature_url text, stamp_url text,
  invoice_prefix text default 'INV', invoice_counter int default 0,
  created_at timestamptz default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz default now(),
  unique (org_id, user_id)
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null, email text, phone text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null, description text,
  unit_price numeric(14,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  number text, number_seq int,
  customer_id uuid references customers(id),
  customer_name text, customer_sub text,
  status text not null default 'draft',
  issue_date date default now(), due_date date,
  subtotal numeric(14,2) default 0, discount numeric(14,2) default 0,
  tax numeric(14,2) default 0, total numeric(14,2) default 0,
  amount_paid numeric(14,2) default 0, notes text,
  created_at timestamptz default now()
);

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  description text not null, sub text,
  quantity numeric(12,3) default 1,
  unit_price numeric(14,2) default 0, tax_rate numeric(5,2) default 0,
  amount numeric(14,2) default 0, position int default 0
);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  invoice_id uuid references invoices(id) on delete cascade,
  number text, amount numeric(14,2), method text default 'Bank transfer',
  issued_at timestamptz default now()
);

-- ---------- helper: which orgs does the current user belong to ----------
create or replace function public.user_org_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select org_id from memberships where user_id = auth.uid();
$$;

-- ---------- Row-Level Security ----------
alter table organizations enable row level security;
alter table memberships   enable row level security;
alter table customers     enable row level security;
alter table products      enable row level security;
alter table invoices      enable row level security;
alter table invoice_items enable row level security;
alter table receipts      enable row level security;

drop policy if exists org_rw on organizations;
create policy org_rw on organizations using (id in (select user_org_ids())) with check (id in (select user_org_ids()));

drop policy if exists mem_rw on memberships;
create policy mem_rw on memberships using (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['customers','products','invoices','invoice_items','receipts'] loop
    execute format('drop policy if exists tenant_rw on %I;', t);
    execute format('create policy tenant_rw on %I using (org_id in (select user_org_ids())) with check (org_id in (select user_org_ids()));', t);
  end loop;
end $$;

-- ---------- new user -> workspace (org + membership + starter data) ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_org uuid;
begin
  insert into organizations (name, mark, email)
    values (coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
            upper(left(coalesce(new.raw_user_meta_data->>'full_name','MB'),2)),
            new.email)
    returning id into new_org;
  insert into memberships (org_id, user_id, role) values (new_org, new.id, 'owner');
  insert into products (org_id, name, description, unit_price, tax_rate) values
    (new_org,'Consulting hour','Professional services',25000,7.5),
    (new_org,'Delivery','Within city',3500,0);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- signup trigger permissions (prevents "Database error saving new user") ----------
alter function public.handle_new_user() owner to postgres;
alter function public.user_org_ids()   owner to postgres;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;
grant select, insert on public.organizations, public.memberships, public.products to supabase_auth_admin;

-- standalone receipt fields
alter table receipts add column if not exists customer_name text;
alter table receipts add column if not exists description text;

-- subscription plan fields
alter table organizations add column if not exists plan text not null default 'free';
alter table organizations add column if not exists plan_status text not null default 'active';
alter table organizations add column if not exists plan_expires timestamptz;

-- void reasons
alter table invoices add column if not exists void_reason text;
alter table invoices add column if not exists voided_at timestamptz;
