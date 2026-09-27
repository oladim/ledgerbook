-- Void reasons. Run in the Supabase SQL editor.
alter table invoices add column if not exists void_reason text;
alter table invoices add column if not exists voided_at timestamptz;
