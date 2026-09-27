-- ============================================================================
-- FIX: "Database error saving new user" on Google sign-in.
-- Run this whole block in the Supabase SQL editor, then try signing in again.
--
-- Why: the signup trigger (handle_new_user) is executed by the `supabase_auth_admin`
-- role and writes into your public tables. For that to work under RLS, the trigger
-- functions must be owned by `postgres` (so, as SECURITY DEFINER, they run as the
-- table owner and bypass RLS), and the auth role needs access to the schema.
-- ============================================================================

-- 1) Own the trigger functions as postgres so they bypass RLS as table owner.
alter function public.handle_new_user() owner to postgres;
alter function public.user_org_ids()   owner to postgres;

-- 2) Let the auth admin reach the public schema and run the trigger function.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- 3) Belt-and-suspenders: allow the auth admin to write the tables the trigger uses.
grant select, insert on
  public.organizations, public.memberships, public.products
  to supabase_auth_admin;
