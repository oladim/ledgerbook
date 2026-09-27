"use client";

import { useStore } from "@/lib/store";
import { fmt } from "@/lib/demo";
import type { ReceiptRow } from "@/server/data";

export function ReceiptsTable({ rows }: { rows: ReceiptRow[] }) {
  const { showReceipt } = useStore();
  if (rows.length === 0) {
    return <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}>No receipts yet.</div>;
  }
  return (
    <table className="data">
      <thead><tr><th>Receipt</th><th>Customer</th><th>Invoice</th><th>Method</th><th className="r">Amount</th><th className="r">View</th></tr></thead>
      <tbody>
        {rows.map((r) => {
          const view = () => showReceipt({ no: r.no, date: r.date, cust: r.cust, invoiceNo: r.invoiceNo, method: r.method, amount: r.amount, total: 0, balance: 0 });
          return (
            <tr key={r.id} onClick={view} style={{ cursor: "pointer" }}>
              <td className="tnum" style={{ fontWeight: 600 }}>{r.no}</td>
              <td>{r.cust}</td>
              <td className="tnum" style={{ color: "var(--muted)" }}>{r.invoiceNo || "—"}</td>
              <td style={{ color: "var(--muted)" }}>{r.method}</td>
              <td className="r tnum" style={{ color: "var(--emerald)" }}>{fmt(r.amount)}</td>
              <td className="r"><span className="link">View &amp; share →</span></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
