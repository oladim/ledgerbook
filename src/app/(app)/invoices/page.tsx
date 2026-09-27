"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmt, badgeClass, badgeText, type Invoice } from "@/lib/demo";
import { Icon } from "@/components/icon";
import { InvoiceDocument, type InvoiceView } from "@/components/documents";
import { getInvoiceDetailAction } from "@/server/actions";
import { printInvoice } from "@/lib/print";
import { shareInvoiceWhatsApp, shareInvoiceLink } from "@/lib/share";

type Filter = "all" | "outstanding" | "paid";

export default function Invoices() {
  const { org, invoices, recordPayment, voidInvoice } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [rowId, setRowId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InvoiceView | null>(null);
  const [loading, setLoading] = useState(false);
  const [pay, setPay] = useState(false); const [amount, setAmount] = useState(""); const [method, setMethod] = useState("Bank transfer");
  const [voiding, setVoiding] = useState(false); const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const shown = invoices.filter((i) =>
    filter === "all" ? true : filter === "paid" ? i.status === "paid" : (i.status === "sent" || i.status === "part_paid" || i.status === "overdue"));

  async function open(inv: Invoice) {
    if (!inv.id) return;
    setRowId(inv.id); setDetail(null); setLoading(true); setPay(false); setVoiding(false);
    const d = await getInvoiceDetailAction(inv.id);
    setDetail(d); setAmount(String(Math.max(0, d.total - d.paid))); setLoading(false);
  }
  function close() { setRowId(null); setDetail(null); setPay(false); setVoiding(false); }
  const node = () => document.querySelector(".invmodal .inv") as HTMLElement | null;

  async function savePay() { if (!rowId) return; const a = parseFloat(amount) || 0; if (a <= 0) return; setBusy(true); await recordPayment(rowId, a, method); setBusy(false); close(); }
  async function doVoid() { if (!rowId) return; setBusy(true); await voidInvoice(rowId, reason); setBusy(false); close(); }

  return (
    <div>
      <div className="tabs">
        {(["all", "outstanding", "paid"] as Filter[]).map((f) => (
          <span key={f} className={`tab${filter === f ? " on" : ""}`} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>{f}</span>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 0 }}>
        <div className="ph"><h3 style={{ textTransform: "capitalize" }}>{filter} invoices</h3><Link className="btn btn-primary btn-sm" href="/invoices/new"><Icon name="plus" /> New invoice</Link></div>
        <table className="data">
          <thead><tr><th>Number</th><th>Customer</th><th>Due</th><th>Status</th><th className="r">Total</th><th className="r">Balance</th></tr></thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}>Nothing here.</td></tr>}
            {shown.map((inv) => {
              const bal = Math.max(0, inv.total - inv.paid);
              return (
                <tr key={inv.id ?? inv.no} onClick={() => open(inv)} style={{ cursor: "pointer" }}>
                  <td className="tnum" style={{ fontWeight: 600 }}>{inv.no}</td>
                  <td>{inv.cust}</td>
                  <td style={{ color: "var(--muted)" }}>{inv.due || "—"}</td>
                  <td><span className={`badge ${badgeClass[inv.status]}`}>{badgeText[inv.status]}</span></td>
                  <td className="r tnum">{fmt(inv.total)}</td>
                  <td className="r tnum" style={bal === 0 ? { color: "var(--emerald)" } : undefined}>{fmt(bal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rowId && (
        <div className="modal open" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="sheet" style={{ maxWidth: 620 }}>
            <div className="close"><button onClick={close}>×</button></div>
            {loading || !detail ? (
              <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading…</div>
            ) : (
              <>
                <div className="invmodal"><InvoiceDocument org={org} inv={detail} /></div>

                {pay ? (
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 16, marginTop: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 10 }}>Record a payment</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><span className="lbl2">Amount (₦)</span><input className="inp" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
                      <div><span className="lbl2">Method</span><select value={method} onChange={(e) => setMethod(e.target.value)}><option>Bank transfer</option><option>Cash</option><option>Card / POS</option><option>Mobile money</option></select></div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0" }}>Balance {fmt(Math.max(0, detail.total - detail.paid))}. Enter less for a part payment.</div>
                    <div style={{ display: "flex", gap: 8 }}><button className="btn btn-primary btn-sm" disabled={busy} onClick={savePay}>{busy ? "Saving…" : "Save payment"}</button><button className="btn btn-white btn-sm" onClick={() => setPay(false)}>Cancel</button></div>
                  </div>
                ) : voiding ? (
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 16, marginTop: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 10 }}>Void this invoice</div>
                    <span className="lbl2">Reason</span><input className="inp" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Duplicate / cancelled order" />
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button className="btn btn-danger btn-sm" disabled={busy} onClick={doVoid} style={{ background: "#b42318", color: "#fff" }}>{busy ? "Voiding…" : "Confirm void"}</button><button className="btn btn-white btn-sm" onClick={() => setVoiding(false)}>Cancel</button></div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
                    <button className="btn btn-primary btn-sm" onClick={() => printInvoice(org, detail, "a4")}><Icon name="file" /> Print</button>
                    <button className="btn btn-white btn-sm" onClick={() => shareInvoiceLink(org, detail, rowId)}><Icon name="send" /> WhatsApp link</button>
                    <button className="btn btn-white btn-sm" onClick={() => shareInvoiceWhatsApp(org, detail, node(), "pdf")}>PDF</button>
                    <button className="btn btn-white btn-sm" onClick={() => shareInvoiceWhatsApp(org, detail, node(), "image")}>Image</button>
                    {detail.status !== "paid" && detail.status !== "void" && <button className="btn btn-white btn-sm" onClick={() => setPay(true)}><Icon name="card" /> Payment</button>}
                    {detail.status !== "void" && <button className="btn btn-white btn-sm" onClick={() => setVoiding(true)} style={{ color: "#b42318" }}>Void</button>}
                    <Link className="btn btn-white btn-sm" href={`/invoices/${rowId}`}>Open full</Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
