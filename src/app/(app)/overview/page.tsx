"use client";

import { useStore } from "@/lib/store";
import { fmt, badgeClass, badgeText } from "@/lib/demo";
import { Icon } from "@/components/icon";
import Link from "next/link";

const BARS = [["Mar", 42], ["Apr", 58], ["May", 50], ["Jun", 71], ["Jul", 63], ["Aug", 88]] as const;

export default function Overview() {
  const { invoices, showInvoiceReceipt } = useStore();
  const recent = invoices.slice(0, 5);

  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "part_paid" || i.status === "overdue")
    .reduce((s, i) => s + Math.max(0, i.total - i.paid), 0);
  const collected = invoices.reduce((s, i) => s + i.paid, 0);
  // VAT (7.5%) actually collected = the tax portion of what customers have paid; this is what you owe FIRS.
  const vatOwed = invoices.reduce((s, i) => s + (i.total > 0 ? i.tax * (i.paid / i.total) : 0), 0);

  return (
    <>
      <div className="stat-grid">
        <div className="stat"><div className="k">Outstanding</div><div className="v">{fmt(outstanding)}</div><div className="d">Across open invoices</div></div>
        <div className="stat money"><div className="k">Collected</div><div className="v">{fmt(collected)}</div><div className="d">Recorded payments to date</div></div>
        <div className="stat warn"><div className="k">VAT owed (7.5%)</div><div className="v">{fmt(vatOwed)}</div><div className="d">Collected VAT payable to FIRS</div></div>
      </div>

      <div className="chartcard">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16 }}>Revenue collected</h3>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Last 6 months</span>
        </div>
        <div className="bars">
          {BARS.map(([m, h], i) => (
            <div key={m} className="bar"><div className={`col${i === BARS.length - 1 ? " hi" : ""}`} style={{ height: `${h}%` }} /><div className="bl">{m}</div></div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="ph"><h3>Recent invoices</h3><Link href="/invoices">View all →</Link></div>
        <table className="data">
          <thead><tr><th>Number</th><th>Customer</th><th>Status</th><th className="r">Total</th><th className="r">Action</th></tr></thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "28px 20px", textAlign: "center", color: "var(--muted)" }}>No invoices yet. <Link className="link" href="/invoices/new">Create your first →</Link></td></tr>
            )}
            {recent.map((inv) => (
              <tr key={inv.id ?? inv.no}>
                <td className="tnum">{inv.no}</td>
                <td>{inv.cust}</td>
                <td><span className={`badge ${badgeClass[inv.status]}`}>{badgeText[inv.status]}</span></td>
                <td className="r tnum">{fmt(inv.total)}</td>
                <td className="r">{inv.status === "paid"
                  ? <span className="link" onClick={() => showInvoiceReceipt(inv)}>Receipt <Icon name="arrow" /></span>
                  : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
