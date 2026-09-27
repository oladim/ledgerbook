"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { fmt, type Org } from "@/lib/demo";
import { Icon } from "@/components/icon";
import { printInvoice } from "@/lib/print";
import { shareInvoiceWhatsApp, shareInvoiceLink } from "@/lib/share";
import type { InvoiceView } from "@/components/documents";

export function InvoiceActions({ org, inv, id }: { org: Org; inv: InvoiceView; id: string }) {
  const { recordPayment, showInvoiceReceipt } = useStore();
  const router = useRouter();
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState(String(Math.max(0, inv.total - inv.paid)));
  const [method, setMethod] = useState("Bank transfer");
  const [busy, setBusy] = useState(false);
  const balance = Math.max(0, inv.total - inv.paid);

  async function save() {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return;
    setBusy(true);
    await recordPayment(id, amt, method);
    setBusy(false); setPayOpen(false);
    router.refresh(); // reload the invoice with its new status/balance
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <button className="btn btn-primary btn-sm" onClick={() => printInvoice(org, inv, "a4")}><Icon name="file" /> Print A4</button>
      <button className="btn btn-white btn-sm" onClick={() => printInvoice(org, inv, "thermal")}>Print label</button>
      <button className="btn btn-white btn-sm" onClick={() => shareInvoiceLink(org, inv, id)}><Icon name="send" /> WhatsApp link</button>
      <button className="btn btn-white btn-sm" onClick={() => shareInvoiceWhatsApp(org, inv, document.querySelector(".invview-doc .inv") as HTMLElement | null, "pdf")}>PDF</button>
      <button className="btn btn-white btn-sm" onClick={() => shareInvoiceWhatsApp(org, inv, document.querySelector(".invview-doc .inv") as HTMLElement | null, "image")}>Image</button>
      {inv.status !== "paid" && <button className="btn btn-white btn-sm" onClick={() => setPayOpen((v) => !v)}><Icon name="card" /> Record payment</button>}
      {inv.paid > 0 && <button className="btn btn-white btn-sm" onClick={() => showInvoiceReceipt({ id, no: inv.no, cust: inv.cust, date: inv.date, status: "paid", total: inv.total, paid: inv.paid, tax: inv.vat })}>Receipt</button>}

      {payOpen && (
        <div style={{ position: "absolute", right: 30, marginTop: 8, top: 120, zIndex: 30, background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 16, boxShadow: "var(--sh-lg)", width: 320 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Record a payment</div>
          <div style={{ marginBottom: 10 }}><span className="lbl2">Amount (₦)</span><input className="inp" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div style={{ marginBottom: 8 }}><span className="lbl2">Method</span>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Bank transfer</option><option>Cash</option><option>Card / POS</option><option>Mobile money</option>
            </select>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Balance {fmt(balance)}. Enter less for a part payment.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" disabled={busy} onClick={save}><Icon name="check" /> {busy ? "Saving…" : "Save"}</button>
            <button className="btn btn-white btn-sm" onClick={() => setPayOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
