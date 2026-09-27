"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { fmt } from "@/lib/demo";
import { Icon } from "@/components/icon";
import { InvoiceDocument } from "@/components/documents";
import { printInvoice } from "@/lib/print";
import { createInvoiceAction } from "@/server/actions";
import { toast } from "@/lib/toast";

type Row = { key: number; sel: string; desc: string; sub: string; qty: number; price: number };
let seq = 0;
const blank = (): Row => ({ key: seq++, sel: "", desc: "", sub: "", qty: 1, price: 0 });

export default function Builder() {
  const { org, catalog, customers } = useStore();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [custIdx, setCustIdx] = useState(0);
  const [discount, setDiscount] = useState("0");
  const [vatRate, setVatRate] = useState("7.5");
  const [due, setDue] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>(() => [blank()]);

  const totals = useMemo(() => {
    const sub = rows.reduce((s, L) => s + L.qty * L.price, 0);
    const disc = Math.min(parseFloat(discount) || 0, sub);
    const rate = parseFloat(vatRate) || 0;
    const vat = Math.round((sub - disc) * (rate / 100) * 100) / 100;
    return { sub, disc, rate, vat, total: sub - disc + vat };
  }, [rows, discount, vatRate]);

  const patch = (key: number, p: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...p } : r)));
  const pick = (key: number, val: string) => {
    if (val === "custom") return patch(key, { sel: "custom", desc: "", sub: "" });
    if (val === "") return patch(key, { sel: "", desc: "", sub: "", price: 0 });
    const c = catalog[+val];
    patch(key, { sel: val, desc: c.name, sub: c.desc, price: c.price });
  };
  const addLine = () => setRows((rs) => [...rs, blank()]);
  const removeLine = (key: number) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));

  const cust = customers[custIdx];
  const custSub = cust ? `${cust.email !== "—" ? cust.email + " · " : ""}${cust.phone !== "—" ? cust.phone : ""}` : "";
  const dueLabel = due ? new Date(due).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "On receipt";
  const view = {
    no: "Draft", date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    due: dueLabel, status: "draft", cust: cust?.name ?? "—", custSub,
    lines: rows.filter((r) => r.desc).map((r) => ({ desc: r.desc, sub: r.sub, qty: r.qty, price: r.price })),
    sub: totals.sub, disc: totals.disc, vatRate: totals.rate, vat: totals.vat, total: totals.total, paid: 0,
  };

  function finalize() {
    const lines = rows.filter((r) => r.desc.trim());
    if (lines.length === 0) return toast("Add at least one item");
    start(async () => {
      const res = await createInvoiceAction({
        customerName: cust?.name ?? "—", customerSub: custSub, discount: totals.disc, vatRate: totals.rate, dueDate: due,
        lines: lines.map((l) => ({ desc: l.desc, sub: l.sub, qty: l.qty, price: l.price })),
      });
      if (!res.ok) {
        if (res.error === "FREE_LIMIT") { toast("Free plan limit reached (5 invoices) — upgrade to continue"); router.push("/billing"); }
        else toast("Could not save invoice");
        return;
      }
      toast("Invoice saved"); router.push("/invoices"); router.refresh();
    });
  }

  return (
    <>
      <div style={{ marginBottom: 18 }}><Link href="/invoices" style={{ color: "var(--muted)", fontSize: 13.5 }}>← Invoices</Link></div>
      <div className="builder">
        <div><div className="bcard">
          <div className="bh">
            <span className="lbl2">Bill to</span>
            <select value={custIdx} onChange={(e) => setCustIdx(+e.target.value)}>
              {customers.length === 0 && <option>Add a customer first</option>}
              {customers.map((c, i) => <option key={c.id ?? i} value={i}>{c.name}</option>)}
            </select>
            <div style={{ marginTop: 12 }}>
              <span className="lbl2">Due date</span>
              <input type="date" className="inp" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
          </div>
          <div className="bb">
            <div className="lrow head" style={{ gridTemplateColumns: "1fr 66px 116px 110px 26px" }}>
              <span>Item</span><span className="r">Qty</span><span className="r">Unit price</span><span className="r">Amount</span><span />
            </div>
            {rows.map((L) => (
              <div className="lrow" key={L.key} style={{ gridTemplateColumns: "1fr 66px 116px 110px 26px" }}>
                {L.sel === "custom" ? (
                  <input className="inp" placeholder="Custom item" value={L.desc} onChange={(e) => patch(L.key, { desc: e.target.value })} />
                ) : (
                  <select value={L.sel} onChange={(e) => pick(L.key, e.target.value)}>
                    <option value="">Select item…</option>
                    {catalog.map((c, i) => <option key={c.id ?? i} value={i}>{c.name}</option>)}
                    <option value="custom">+ Custom item</option>
                  </select>
                )}
                <input className="inp r" type="number" min={0} step="0.5" value={L.qty} onChange={(e) => patch(L.key, { qty: parseFloat(e.target.value) || 0 })} />
                <input className="inp r" type="number" min={0} step="0.01" value={L.price} onChange={(e) => patch(L.key, { price: parseFloat(e.target.value) || 0 })} />
                <span className="amt">{fmt(L.qty * L.price)}</span>
                <button className="xbtn" onClick={() => removeLine(L.key)}>×</button>
              </div>
            ))}
            <div className="additem" onClick={addLine}><Icon name="plus" style={{ width: 15, height: 15 }} /> Add item</div>

            <div style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              <div className="totline"><span style={{ color: "var(--muted)" }}>Subtotal</span><span className="tnum">{fmt(totals.sub)}</span></div>
              <div className="totline"><span style={{ color: "var(--muted)" }}>Discount</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: "var(--muted)" }}>₦</span>
                  <input className="inp tnum" value={discount} onChange={(e) => setDiscount(e.target.value)} style={{ width: 100, textAlign: "right", padding: "6px 8px" }} /></span>
              </div>
              <div className="totline"><span style={{ color: "var(--muted)" }}>VAT rate</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input className="inp tnum" value={vatRate} onChange={(e) => setVatRate(e.target.value)} style={{ width: 70, textAlign: "right", padding: "6px 8px" }} /><span style={{ color: "var(--muted)" }}>%</span></span>
              </div>
              <div className="totline"><span style={{ color: "var(--muted)" }}>VAT amount</span><span className="tnum">{fmt(totals.vat)}</span></div>
              <div className="totline grandline"><span className="lbl">Total</span><span className="tnum">{fmt(totals.total)}</span></div>
            </div>
            <div style={{ marginTop: 16, display: "grid", gap: 9 }}>
              <button className="btn btn-primary" style={{ justifyContent: "center" }} disabled={pending} onClick={finalize}><Icon name="send" /> {pending ? "Saving…" : "Finalize & save"}</button>
              <button className="btn btn-white" style={{ justifyContent: "center" }} onClick={() => printInvoice(org, view, "a4")}><Icon name="file" /> Print (A4)</button>
            </div>
          </div>
        </div></div>

        <div><div className="previewwrap">
          <InvoiceDocument org={org} inv={view} />
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            <button className="btn btn-white btn-sm" onClick={() => printInvoice(org, view, "a4")}>Print A4</button>
            <button className="btn btn-white btn-sm" onClick={() => printInvoice(org, view, "thermal")}>Print label</button>
          </div>
          <div className="previewcap">Live preview · exactly what your customer receives</div>
        </div></div>
      </div>
    </>
  );
}
