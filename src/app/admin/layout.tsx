import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminEmails } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const allowed = user?.email && adminEmails().includes(user.email.toLowerCase());
  if (!allowed) redirect("/signin");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ height: 60, background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}>
          <span className="seal">Lb</span> Ledgerbook · Admin
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 13 }}>
          <span style={{ color: "#8399ba" }}>{user?.email}</span>
          <Link href="/overview" style={{ color: "#fff" }}>App →</Link>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 28 }}>{children}</div>
    </div>
  );
}
