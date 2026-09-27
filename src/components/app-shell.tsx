"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { StoreProvider, useStore, type Workspace } from "@/lib/store";
import { ReceiptDocument } from "@/components/documents";
import { printReceipt } from "@/lib/print";
import { shareReceiptWhatsApp } from "@/lib/share";

const NAV = [
  { href: "/overview", label: "Overview", icon: "dash" },
  { href: "/invoices", label: "Invoices", icon: "file" },
  { href: "/receipts", label: "Receipts", icon: "card" },
  { href: "/reminders", label: "Reminders", icon: "send" },
  { href: "/items", label: "Items", icon: "tag" },
  { href: "/customers", label: "Customers", icon: "users" },
];
const TITLES: Record<string, string> = {
  "/overview": "Overview", "/invoices": "Invoices", "/invoices/new": "New invoice",
  "/receipts": "Receipts", "/receipts/new": "New receipt", "/reminders": "Reminders",
  "/items": "Items", "/customers": "Customers", "/settings": "Settings", "/billing": "Billing",
};

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { org, email, receipt, closeReceipt } = useStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const title = TITLES[pathname] ?? (pathname.startsWith("/invoices/") ? "Invoice" : "Overview");
  const isOn = (href: string) => (href === "/overview" ? pathname === "/overview" : pathname.startsWith(href));

  return (
    <div className="app">
      <aside className={`side${menuOpen ? " open" : ""}`}>
        <div className="brand"><span className="seal">Lb</span> Ledgerbook</div>
        <div className="navlbl">Workspace</div>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={closeMenu} className={`nav${isOn(n.href) ? " on" : ""}`}><Icon name={n.icon} /> {n.label}</Link>
        ))}
        <div className="navlbl">Account</div>
        <Link href="/billing" onClick={closeMenu} className={`nav${pathname === "/billing" ? " on" : ""}`}><Icon name="card" /> Billing</Link>
        <Link href="/settings" onClick={closeMenu} className={`nav${pathname === "/settings" ? " on" : ""}`}><Icon name="settings" /> Settings</Link>
        <form action="/auth/signout" method="post" style={{ marginTop: 2 }}>
          <button type="submit" className="nav navbtn"><Icon name="logout" /> Sign out</button>
        </form>
        <div className="usr"><div className="avatar">{org.mark}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#fff", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{org.name}</div>
            <div style={{ fontSize: 12, color: "#8399ba", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email ?? "Free plan"}</div>
          </div>
        </div>
      </aside>
      {menuOpen && <div className="backdrop" onClick={closeMenu} />}

      <div className="main">
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center" }}>
            <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">☰</button>
            <h2>{title}</h2>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="search"><Icon name="search" /> <input placeholder="Search invoices, customers…" /></div>
            <Link className="btn btn-primary btn-sm" href="/invoices/new"><Icon name="plus" /> New invoice</Link>
          </div>
        </div>
        <div className="apppage page anim" key={pathname}>{children}</div>
      </div>

      {receipt && (
        <div className="modal open" onClick={(e) => { if (e.target === e.currentTarget) closeReceipt(); }}>
          <div className="sheet">
            <div className="close"><button onClick={closeReceipt}>×</button></div>
            <div ref={receiptRef}><ReceiptDocument org={org} rcpt={receipt} /></div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-sm" onClick={() => printReceipt(org, receipt, "a4")}><Icon name="file" /> Print A4</button>
              <button className="btn btn-white btn-sm" onClick={() => printReceipt(org, receipt, "thermal")}>Print label</button>
              <button className="btn btn-white btn-sm" onClick={() => shareReceiptWhatsApp(org, receipt, receiptRef.current, "pdf")}><Icon name="send" /> Share PDF</button>
              <button className="btn btn-white btn-sm" onClick={() => shareReceiptWhatsApp(org, receipt, receiptRef.current, "image")}><Icon name="image" /> Share image</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ initial, children }: { initial: Workspace; children: React.ReactNode }) {
  return (<StoreProvider initial={initial}><Shell>{children}</Shell></StoreProvider>);
}
