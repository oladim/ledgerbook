-- Subscription plan fields. Run in the Supabase SQL editor.
alter table organizations add column if not exists plan text not null default 'free';
alter table organizations add column if not exists plan_status text not null default 'active';
alter table organizations add column if not exists plan_expires timestamptz;
