import { adminClient } from "@/lib/supabase/admin";
import { AdminTable, type AdminOrg } from "@/components/admin-table";

export const dynamic = "force-dynamic";

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel" style={{ marginTop: 0, padding: 24 }}>
      <div style={{ fontWeight: 700, color: "var(--amber)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "var(--muted)", whiteSpace: "pre-wrap" }}>{body}</div>
    </div>
  );
}

export default async function AdminHome() {
  // 1) service role key must be present, or we can't read across tenants
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Clients</h1>
        <Notice title="Service role key missing"
          body={"Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Project Settings → API → service_role key), then restart the dev server.\nThis key is required for the admin console to read every organisation, and must never be exposed to the browser."} />
      </>
    );
  }

  const db = adminClient();
  // select * so it works whether or not the plan migration has been run yet
  const { data: orgs, error } = await db
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Clients</h1>
        <Notice title="Could not load organisations" body={`${error.message}\n\nIf this mentions a missing column (plan / plan_status / plan_expires), run supabase/migration-plans.sql in the Supabase SQL editor.`} />
      </>
    );
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows: AdminOrg[] = (orgs ?? []).map((o: any) => ({
    id: o.id, name: o.name ?? "—", email: o.email ?? "—",
    plan: o.plan ?? "free", status: o.plan_status ?? "active",
    expires: o.plan_expires ?? null, invoices: o.invoice_counter ?? 0, created: o.created_at,
  }));

  return (
    <>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Clients</h1>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>{rows.length} organisation{rows.length === 1 ? "" : "s"}</p>
      <div className="panel" style={{ marginTop: 0 }}><AdminTable rows={rows} /></div>
    </>
  );
}
