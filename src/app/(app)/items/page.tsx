"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmt } from "@/lib/demo";
import { Icon } from "@/components/icon";
import { toast } from "@/lib/toast";

export default function Items() {
  const { catalog, addProduct } = useStore();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("0");
  const [vat, setVat] = useState("7.5");

  function add() {
    if (!name.trim()) return;
    addProduct({ name: name.trim(), desc: desc.trim(), price: parseFloat(price) || 0, vat: parseFloat(vat) || 0 });
    setName(""); setDesc(""); setPrice("0"); setVat("7.5");
    toast("Item added — now in the invoice picker");
  }

  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <div className="ph"><h3>Items</h3><span style={{ fontSize: 12.5, color: "var(--muted)" }}>These appear in the picker when you create an invoice</span></div>
      <div className="addform">
        <div><span className="lbl2">Item name</span><input className="inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Printing (A4)" /></div>
        <div><span className="lbl2">Description</span><input className="inp" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="optional" /></div>
        <div><span className="lbl2">Unit price ₦</span><input className="inp" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><span className="lbl2">VAT %</span><input className="inp" type="number" min={0} max={100} step="0.1" value={vat} onChange={(e) => setVat(e.target.value)} /></div>
        <button className="btn btn-primary" onClick={add}><Icon name="plus" /> Add</button>
      </div>
      <table className="data">
        <thead><tr><th>Item</th><th>Description</th><th className="r">VAT</th><th className="r">Unit price</th></tr></thead>
        <tbody>
          {catalog.map((c, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600 }}>{c.name}</td>
              <td style={{ color: "var(--muted)" }}>{c.desc || "—"}</td>
              <td className="r tnum" style={{ color: "var(--muted)" }}>{c.vat}%</td>
              <td className="r tnum">{fmt(c.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
