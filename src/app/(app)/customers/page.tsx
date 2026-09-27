"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/icon";
import { toast } from "@/lib/toast";

export default function Customers() {
  const { customers, addCustomer } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  function add() {
    if (!name.trim()) return;
    addCustomer({ name: name.trim(), email: email.trim() || "—", phone: phone.trim() || "—" });
    setName(""); setEmail(""); setPhone("");
    toast("Customer saved");
  }

  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <div className="ph"><h3>Customers</h3><span style={{ fontSize: 12.5, color: "var(--muted)" }}>Reused when you create an invoice</span></div>
      <div className="addform" style={{ gridTemplateColumns: "1.3fr 1.3fr 1fr auto" }}>
        <div><span className="lbl2">Name</span><input className="inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer or company" /></div>
        <div><span className="lbl2">Email</span><input className="inp" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="optional" /></div>
        <div><span className="lbl2">Phone</span><input className="inp" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="optional" /></div>
        <button className="btn btn-primary" onClick={add}><Icon name="plus" /> Add</button>
      </div>
      <table className="data">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
        <tbody>
          {customers.length === 0 && (
            <tr><td colSpan={3} style={{ padding: "36px 20px", textAlign: "center", color: "var(--muted)" }}>No customers yet. Add your first above.</td></tr>
          )}
          {customers.map((c, i) => (
            <tr key={c.id ?? i}>
              <td>{c.name}</td>
              <td style={{ color: "var(--muted)" }}>{c.email}</td>
              <td className="tnum" style={{ color: "var(--muted)" }}>{c.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
