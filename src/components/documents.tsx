import { fmt, type Org, type ReceiptView } from "@/lib/demo";
import { nairaWords } from "@/lib/words";

export type DocLine = { desc: string; sub?: string; qty: number; price: number };
export type InvoiceView = {
  no: string; date: string; due: string; status: string;
  cust: string; custSub?: string; voidReason?: string;
  lines: DocLine[]; sub: number; disc: number; vatRate: number; vat: number; total: number; paid: number;
};

const ST_CLS: Record<string, string> = { paid: "st-paid", sent: "st-sent", part_paid: "st-part", overdue: "st-over", void: "st-void" };
const ST_TXT: Record<string, string> = { paid: "PAID", sent: "SENT", part_paid: "PART PAID", overdue: "OVERDUE", void: "VOID" };

export function InvoiceDocument({ org, inv }: { org: Org; inv: InvoiceView }) {
  const accVars = { ["--acc1" as string]: org.acc[0], ["--acc2" as string]: org.acc[1] } as React.CSSProperties;
  const balance = Math.max(0, inv.total - inv.paid);
  const showNo = inv.no && inv.no !== "Draft";
  const showStatus = inv.status && inv.status !== "draft";
  return (
    <div className="inv" style={accVars}>
      <div className="band" />
      <div className="inv-pad">
        <div className="inv-head">
          <div className="inv-id">
            <div className="inv-logo">
              {org.logo ? (
                <div className="mk" style={{ background: "#fff", border: "1px solid var(--line)", padding: 5 }}>
                  <img src={org.logo} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
              ) : (<div className="mk">{org.mark}</div>)}
              <div className="nm">{org.name}</div>
            </div>
            <div className="inv-co-lines">{org.lines.map((l, i) => <div key={i}>{l}</div>)}</div>
          </div>
          <div className="inv-title">
            <div className="big">INVOICE</div>
            <div className="inv-meta">
              {showNo && <div><span>No</span><b>{inv.no}</b></div>}
              <div><span>Issued</span><b>{inv.date}</b></div>
              <div><span>Due</span><b>{inv.due}</b></div>
            </div>
            {showStatus && <div className={`inv-status ${ST_CLS[inv.status] || ""}`}>{ST_TXT[inv.status] || ""}</div>}
          </div>
        </div>

        {inv.status === "void" && (
          <div style={{ margin: "12px 0 0", padding: "9px 13px", background: "#fbeaea", color: "#b42318", borderRadius: 9, fontSize: 12.5, fontWeight: 600 }}>
            VOID{inv.voidReason ? ` — ${inv.voidReason}` : ""}
          </div>
        )}

        <div className="inv-billto">
          <div><div className="lbl">Bill to</div><div className="who">{inv.cust}</div><div className="sub">{inv.custSub}</div></div>
          <div style={{ textAlign: "right" }}>
            <div className="lbl">Amount due</div>
            <div className="who tnum" style={{ color: "var(--acc1)" }}>{fmt(balance)}</div>
          </div>
        </div>

        <table className="inv-tb">
          <thead><tr><th></th><th>Description</th><th className="r">Qty</th><th className="r">Unit price</th><th className="r">Amount</th></tr></thead>
          <tbody>
            {inv.lines.length ? inv.lines.map((L, i) => (
              <tr key={i}>
                <td style={{ color: "var(--muted)", width: 22 }}>{i + 1}</td>
                <td><div className="d">{L.desc || "—"}</div>{L.sub ? <div className="s">{L.sub}</div> : null}</td>
                <td className="r">{(+L.qty).toLocaleString()}</td>
                <td className="r">{fmt(L.price)}</td>
                <td className="r">{fmt(L.qty * L.price)}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{ color: "var(--muted)", padding: "14px 10px" }}>Add an item to see it on the invoice…</td></tr>
            )}
          </tbody>
        </table>

        <div className="inv-tot"><div className="box">
          <div className="r muted"><span>Subtotal</span><span>{fmt(inv.sub)}</span></div>
          <div className="r muted"><span>Discount</span><span>-{fmt(inv.disc)}</span></div>
          <div className="r muted"><span>VAT ({inv.vatRate}%)</span><span>{fmt(inv.vat)}</span></div>
          <div className="r grand"><span>Total</span><span>{fmt(inv.total)}</span></div>
          {inv.paid > 0 && <>
            <div className="r muted"><span>Paid</span><span>-{fmt(inv.paid)}</span></div>
            <div className="r grand" style={{ color: "var(--acc1)" }}><span>Balance due</span><span>{fmt(balance)}</span></div>
          </>}
        </div></div>

        <div className="inv-words"><span className="lbl">Amount in words</span><div>{nairaWords(inv.total)}</div></div>

        <div className="inv-foot">
          <div><div className="lbl">Payment details</div><div className="pay"><b>{org.bank.bank}</b><br />{org.bank.name}<br />{org.bank.acct}</div></div>
          <div><div className="lbl">Terms</div><div className="terms">{org.terms}</div></div>
        </div>

        <div className="inv-sign">
          <div className="inv-thanks">{org.thanks}</div>
          <div className="inv-sigblock">
            {(org.sig || org.stamp) && (
              <div className="sigwrap">
                {org.sig && <img className="sig" src={org.sig} alt="signature" />}
                {org.stamp && <img className="stamp" src={org.stamp} alt="stamp" />}
              </div>
            )}
            <div className="inv-sigline"><div className="ln" />Authorised signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReceiptDocument({ org, rcpt }: { org: Org; rcpt: ReceiptView }) {
  const full = rcpt.balance <= 0;
  return (
    <div className="rcpt">
      <div className="band" />
      <div className="rcpt-pad">
        <div className="rcpt-top">
          <div className="inv-id">
            <div className="inv-logo">
              <div className="mk" style={{ background: "linear-gradient(140deg,var(--emerald),#0b8a5f)" }}>{org.mark}</div>
              <div className="nm">{org.name}</div>
            </div>
            <div className="inv-co-lines" style={{ marginTop: 8 }}>{org.lines[0]}<br />{org.lines[1]}</div>
          </div>
          <div className="inv-title">
            <div className="big" style={{ color: "var(--emerald)" }}>RECEIPT</div>
            <div className="inv-meta"><div><span>No</span><b>{rcpt.no}</b></div><div><span>Date</span><b>{rcpt.date}</b></div></div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="rcpt-row"><span className="k">Received from</span><span className="v">{rcpt.cust}</span></div>
          <div className="rcpt-row"><span className="k">For invoice</span><span className="v tnum">{rcpt.invoiceNo || "—"}</span></div>
          <div className="rcpt-row"><span className="k">Payment method</span><span className="v">{rcpt.method}</span></div>
        </div>
        <div className="rcpt-amt"><div className="k">Amount received</div><div className="v">{fmt(rcpt.amount)}</div></div>
        <div className="inv-words" style={{ marginTop: 12 }}><span className="lbl">Amount in words</span><div>{nairaWords(rcpt.amount)}</div></div>
        {rcpt.total > 0 && (
          <>
            <div className="rcpt-row" style={{ marginTop: 10 }}><span className="k">Invoice total</span><span className="v tnum">{fmt(rcpt.total)}</span></div>
            <div className="rcpt-row"><span className="k">Balance remaining</span><span className="v tnum">{fmt(rcpt.balance)}</span></div>
          </>
        )}
        <div className="rcpt-foot">
          <div style={{ fontSize: 11, color: "var(--muted)", maxWidth: "60%" }}>{org.thanks} {full ? "This receipt confirms full payment." : "Part payment received; balance remains outstanding."}</div>
          <div className="rcpt-stamp">{full ? "PAID" : "PART"}<br />{org.mark}</div>
        </div>
      </div>
    </div>
  );
}
