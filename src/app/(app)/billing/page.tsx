import { getPlanInfo } from "@/server/actions";
import { BillingPlans } from "@/components/billing-plans";
import { fmt } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function Billing({ searchParams }: { searchParams: Promise<{ paid?: string; error?: string }> }) {
  const sp = await searchParams;
  const info = await getPlanInfo();
  const isPaid = info.plan !== "free";
  const expires = info.expires ? new Date(info.expires).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null;

  return (
    <div style={{ maxWidth: 900 }}>
      {sp.paid && <div style={{ background: "var(--emerald-soft)", color: "var(--emerald)", padding: "12px 16px", borderRadius: 12, marginBottom: 16, fontWeight: 600 }}>Payment successful — your plan is active.</div>}
      {sp.error && <div style={{ background: "var(--amber-soft)", color: "var(--amber)", padding: "12px 16px", borderRadius: 12, marginBottom: 16, fontWeight: 600 }}>We couldn&apos;t confirm that payment. If you were charged, contact support.</div>}

      <div className="scard">
        <div className="sh"><div className="ci"><span style={{ fontWeight: 700 }}>₦</span></div>
          <div><h3>Your plan</h3><p>{isPaid ? `${info.plan[0].toUpperCase() + info.plan.slice(1)} · active${expires ? ` until ${expires}` : ""}` : "Free plan"}</p></div>
        </div>
        <div className="sb">
          {info.limit != null
            ? <div style={{ fontSize: 14 }}>You&apos;ve issued <b>{info.used}</b> of <b>{info.limit}</b> free invoices. {info.used >= info.limit && <span style={{ color: "var(--amber)", fontWeight: 600 }}>Limit reached — upgrade to keep invoicing.</span>}</div>
            : <div style={{ fontSize: 14, color: "var(--emerald)", fontWeight: 600 }}>Unlimited invoices on your current plan.</div>}
        </div>
      </div>

      <h3 style={{ margin: "22px 0 14px" }}>Upgrade</h3>
      <BillingPlans current={info.plan} />
      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 14 }}>Payments are processed securely by Paystack. Your plan activates automatically once payment is confirmed. The free plan allows 5 invoices.</p>
    </div>
  );
}
