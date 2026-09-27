"use client";

import { useState, useTransition } from "react";
import { PRICING, type PlanKey } from "@/lib/pricing";
import { initPaystackAction } from "@/server/actions";
import { fmt } from "@/lib/demo";
import { Icon } from "@/components/icon";
import { toast } from "@/lib/toast";

export function BillingPlans({ current }: { current: string }) {
  const [cycle, setCycle] = useState<"month" | "year">("month");
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<string>("");

  function pay(plan: PlanKey) {
    setWhich(plan + cycle);
    start(async () => {
      const res = await initPaystackAction(plan, cycle);
      if (res.ok) window.location.href = res.url;
      else toast(res.error);
    });
  }

  const plans: { key: PlanKey; blurb: string; feats: string[] }[] = [
    { key: "basic", blurb: "For getting steady", feats: ["Unlimited invoices & receipts", "Branded documents", "WhatsApp share", "Print A4 & label"] },
    { key: "pro", blurb: "For growing businesses", feats: ["Everything in Basic", "Priority support", "Early access to new features", "Best value annually"] },
  ];

  return (
    <>
      <div style={{ display: "inline-flex", background: "#fff", border: "1px solid var(--line)", borderRadius: 999, padding: 4, marginBottom: 16 }}>
        {(["month", "year"] as const).map((c) => (
          <button key={c} onClick={() => setCycle(c)} className="btn btn-sm" style={{ borderRadius: 999, background: cycle === c ? "var(--primary)" : "transparent", color: cycle === c ? "#fff" : "var(--muted)" }}>
            {c === "month" ? "Monthly" : "Annual (save more)"}
          </button>
        ))}
      </div>
      <div className="pricing">
        {plans.map((p) => {
          const price = PRICING[p.key][cycle];
          const isCurrent = current === p.key;
          return (
            <div key={p.key} className={`price${p.key === "pro" ? " feat" : ""}`}>
              <h3>{PRICING[p.key].label}</h3>
              <div className="amt">{fmt(price)}<span> /{cycle}</span></div>
              <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "4px 0 0" }}>{p.blurb}{cycle === "year" ? ` · ${p.key === "pro" ? "15%" : "10%"} off` : ""}</p>
              <ul>{p.feats.map((f) => <li key={f}><Icon name="check" /> {f}</li>)}</ul>
              <button className={`btn ${p.key === "pro" ? "btn-gold" : "btn-primary"}`} disabled={pending || isCurrent} onClick={() => pay(p.key)}>
                {isCurrent ? "Current plan" : pending && which === p.key + cycle ? "Starting…" : `Pay with Paystack`}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
