"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/icon";
import { createReceiptAction } from "@/server/actions";
import { toast } from "@/lib/toast";

export default function NewReceipt() {
  const { showReceipt } = useStore();
  const [pending, start] = useTransition();
  const [cust, setCust] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [description, setDescription] = useState("");

  function generate() {
    const amt = parseFloat(amount) || 0;
    if (!cust.trim() || amt <= 0) return toast("Enter a customer and amount");
    start(async () => {
      const r = await createReceiptAction({ cust: cust.trim(), amount: amt, method, description: description.trim() });
      showReceipt(r);           // opens the receipt with print options
      toast("Receipt created");
      setCust(""); setAmount(""); setDescription("");
    });
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 16 }}><Link href="/receipts" style={{ color: "var(--muted)", fontSize: 13.5 }}>← Receipts</Link></div>
      <div className="scard">
        <div className="sh"><div className="ci"><Icon name="card" /></div><div><h3>New receipt</h3><p>Generate a receipt without an invoice</p></div></div>
        <div className="sb">
          <div className="fld"><label>Received from</label><input className="inp" value={cust} onChange={(e) => setCust(e.target.value)} placeholder="Customer name" /></div>
          <div className="grid2">
            <div className="fld"><label>Amount (₦)</label><input className="inp" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div className="fld"><label>Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option>Cash</option><option>Bank transfer</option><option>Card / POS</option><option>Mobile money</option>
              </select>
            </div>
          </div>
          <div className="fld"><label>For (description)</label><input className="inp" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Deposit for catering" /></div>
          <button className="btn btn-primary" disabled={pending} onClick={generate}><Icon name="check" /> {pending ? "Creating…" : "Generate receipt"}</button>
        </div>
      </div>
    </div>
  );
}
