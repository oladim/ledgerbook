// Browser Supabase client (for Client Components). Uses the public anon key;
// RLS enforces tenant isolation on every request.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.SECRETS_SCAN_OMIT_KEYS!,
    process.env.SECRETS_SCAN_OMIT_PATHS!,
  );
}
