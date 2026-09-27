"use client";

import { useTransition } from "react";
import { setOrgPlanAction } from "@/server/admin-actions";

export type AdminOrg = { id: string; name: string; email: string; plan: string; status: string; expires: string | null; invoices: number; created: string };

export function AdminTable({ rows }: { rows: AdminOrg[] }) {
  const [pending, start] = useTransition();
  const set = (orgId: string, plan: string, status: string, months: number) =>
    start(() => setOrgPlanAction({ orgId, plan, status, months }));
  const d = (s: string | null) => (s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—");

  return (
    <table className="data">
      <thead><tr><th>Business</th><th>Email</th><th>Plan</th><th>Status</th><th>Expires</th><th className="r">Invoices</th><th className="r">Manage</th></tr></thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan={7} style={{ padding: 30, textAlign: "center", color: "var(--muted)" }}>No organisations yet.</td></tr>}
        {rows.map((o) => (
          <tr key={o.id}>
            <td style={{ fontWeight: 600 }}>{o.name}</td>
            <td style={{ color: "var(--muted)" }}>{o.email}</td>
            <td><span className="badge b-sent" style={{ textTransform: "capitalize" }}>{o.plan}</span></td>
            <td><span className={`badge ${o.status === "active" ? "b-paid" : "b-overdue"}`}>{o.status}</span></td>
            <td className="tnum" style={{ color: "var(--muted)" }}>{d(o.expires)}</td>
            <td className="r tnum">{o.invoices}</td>
            <td className="r">
              <select defaultValue="" disabled={pending} onChange={(e) => {
                const v = e.target.value; e.target.value = "";
                if (v === "free") set(o.id, "free", "active", 0);
                if (v === "basic") set(o.id, "basic", "active", 1);
                if (v === "pro") set(o.id, "pro", "active", 1);
                if (v === "pro12") set(o.id, "pro", "active", 12);
                if (v === "suspend") set(o.id, o.plan, "suspended", 0);
                if (v === "activate") set(o.id, o.plan, "active", 1);
              }} style={{ width: 150, display: "inline-block" }}>
                <option value="" disabled>Set…</option>
                <option value="free">Free</option>
                <option value="basic">Basic · 1 mo</option>
                <option value="pro">Pro · 1 mo</option>
                <option value="pro12">Pro · 12 mo</option>
                <option value="suspend">Suspend</option>
                <option value="activate">Activate</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
