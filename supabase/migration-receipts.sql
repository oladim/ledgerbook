-- Optional: richer standalone receipts. Run in the Supabase SQL editor.
alter table receipts add column if not exists customer_name text;
alter table receipts add column if not exists description text;
