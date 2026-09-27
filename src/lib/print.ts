import { fmt, type Org } from "@/lib/demo";
import { nairaWords } from "@/lib/words";

export type PrintFormat = "a4" | "thermal";
export type PrintLine = { desc: string; sub?: string; qty: number; price: number };
export type PrintInvoice = {
  no: string; date: string; due: string; status: string;
  cust: string; custSub?: string; lines: PrintLine[];
  sub: number; disc: number; vatRate: number; vat: number; total: number; paid: number;
};
export type PrintReceipt = {
  no: string; date: string; cust: string; invoiceNo: string; method: string;
  amount: number; total: number; balance: number;
};

const money = (n: number) => fmt(n);
const esc = (s: string) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const STATUS: Record<string, string> = { paid: "Paid", part_paid: "Part paid", overdue: "Overdue", sent: "Sent" };

function shell(inner: string, acc: [string, string], format: PrintFormat) {
  const css = `
  *{box-sizing:border-box}html,body{margin:0;padding:0}
  body{font-family:'Poppins','Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#12203a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .tnum{font-variant-numeric:tabular-nums}
  .doc{--acc:${acc[0]};--acc2:${acc[1]}}

  /* ---- A4 ---- */
  .a4 .doc{max-width:190mm;margin:0 auto;display:flex;flex-direction:column;min-height:calc(297mm - 28mm);border:1.5px solid #000;padding:18px 22px 22px;border-radius:4px}
  .a4 .doc, .a4 .doc *{color:#000}
  .a4 .logo{color:#fff}
  .a4 .tail{margin-top:auto}
  .a4 .band{height:6px;background:linear-gradient(90deg,var(--acc),var(--acc2));border-radius:4px}
  .a4 .head{display:flex;justify-content:space-between;align-items:flex-start;gap:26px;margin-top:24px;padding-bottom:20px;border-bottom:2px solid #12203a}
  .a4 .co{display:flex;gap:15px;align-items:center;margin-bottom:12px}
  .a4 .logo{width:56px;height:56px;border-radius:14px;background:linear-gradient(140deg,var(--acc),var(--acc2));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px;overflow:hidden}
  .a4 .logo img{width:100%;height:100%;object-fit:contain;background:#fff}
  .a4 .co-name{font-size:21px;font-weight:700;letter-spacing:-.015em}
  .a4 .co-lines{color:#6b7890;font-size:11.5px;line-height:1.8}
  .a4 .meta{text-align:right;min-width:220px}
  .a4 .doctype{font-size:34px;font-weight:700;letter-spacing:.22em;color:var(--acc);line-height:1;margin-bottom:14px}
  .a4 .meta-rows>div{display:flex;justify-content:flex-end;gap:16px;font-size:12px;padding:3px 0}
  .a4 .meta-rows span{color:#98a4b6}
  .a4 .meta-rows b{color:#12203a;font-weight:600;min-width:104px;text-align:right}
  .a4 .status{display:inline-block;margin-top:12px;font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;padding:5px 13px;border-radius:999px;background:rgba(0,0,0,.05);color:var(--acc)}
  .a4 .parties{display:flex;justify-content:space-between;gap:24px;margin:22px 0 6px;padding:16px 0;border-bottom:1px solid #eef1f6}
  .a4 .lbl{font-size:9.5px;text-transform:uppercase;letter-spacing:.13em;color:#98a4b6;font-weight:600;margin-bottom:6px}
  .a4 .party{font-size:15px;font-weight:600}
  .a4 .party-sub{color:#6b7890;font-size:11.5px;margin-top:2px}
  .a4 .due{text-align:right}
  .a4 .due-amt{font-size:23px;font-weight:700;color:var(--acc)}
  .a4 table.items{width:100%;border-collapse:collapse;margin-top:18px;font-size:12px}
  .a4 table.items thead th{text-align:left;font-size:9.5px;text-transform:uppercase;letter-spacing:.09em;color:#98a4b6;font-weight:600;padding:0 12px 10px;border-bottom:2px solid #12203a}
  .a4 table.items th.r,.a4 table.items td.r{text-align:right}
  .a4 table.items th.n,.a4 table.items td.n{width:26px;color:#b6c0cf}
  .a4 table.items tbody td{padding:12px;border-bottom:1px solid #eef1f6;vertical-align:top}
  .a4 table.items .d{font-weight:600}
  .a4 table.items .s{color:#6b7890;font-size:10.5px;margin-top:1px}
  .a4 thead{display:table-header-group}.a4 tr{break-inside:avoid}
  .a4 .lower{display:flex;justify-content:space-between;gap:28px;margin-top:20px;break-inside:avoid}
  .a4 .words{flex:1;padding:13px 15px;background:rgba(0,0,0,.03);border-left:3px solid var(--acc);border-radius:9px;align-self:flex-start}
  .a4 .words .wl{font-size:9px;text-transform:uppercase;letter-spacing:.13em;color:#98a4b6;font-weight:600}
  .a4 .words .wv{font-size:12.5px;font-weight:600;font-style:italic;margin-top:3px}
  .a4 .sumbox{width:264px}
  .a4 .sumbox>div{display:flex;justify-content:space-between;font-size:12px;padding:7px 0}
  .a4 .sumbox>div span:first-child{color:#6b7890}
  .a4 .sumbox .grand{border-top:2px solid #12203a;margin-top:6px;padding-top:11px;font-size:16px;font-weight:700}
  .a4 .sumbox .grand span:first-child{color:#12203a}
  .a4 .sumbox .bal{background:rgba(0,144,252,.08);border-radius:8px;padding:9px 10px;margin-top:6px;font-weight:700;color:var(--acc)}
  .a4 .sumbox .bal span:first-child{color:var(--acc)}
  .a4 .foot{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px;padding-top:18px;border-top:1px solid #eef1f6;break-inside:avoid}
  .a4 .foot .pay{font-size:11.5px;line-height:1.9}.a4 .foot .pay b{font-weight:600}
  .a4 .foot .terms{font-size:10.5px;color:#6b7890;line-height:1.7}
  .a4 .sign{display:flex;justify-content:space-between;align-items:flex-end;margin-top:24px;break-inside:avoid}
  .a4 .thanks{font-weight:600;font-size:13px}
  .a4 .sigwrap{position:relative;height:56px;width:170px;margin:0 auto 4px}
  .a4 .sigwrap .sig{max-height:52px;max-width:160px;position:absolute;left:8px;bottom:6px}
  .a4 .sigwrap .stamp{max-height:60px;max-width:80px;position:absolute;right:0;bottom:0;mix-blend-mode:multiply}
  .a4 .sigline{border-top:1px solid #b6c0cf;padding-top:5px;font-size:10px;color:#98a4b6;width:170px;text-align:center}

  /* ---- thermal 72mm ---- */
  .thermal{width:72mm;margin:0 auto;color:#000}
  .thermal .doc, .thermal .doc *{color:#000}
  .thermal .t-logo{color:#fff}
  .thermal .band{display:none}.thermal .doc{width:72mm;border:1px solid #000;padding:10px 10px 12px}
  .thermal .t-center{text-align:center}
  .thermal .t-logo{width:46px;height:46px;border-radius:11px;background:var(--acc);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;overflow:hidden;margin-bottom:6px}
  .thermal .t-logo img{width:100%;height:100%;object-fit:contain;background:#fff}
  .thermal .t-name{font-size:16px;font-weight:700}
  .thermal .t-lines{font-size:10.5px;line-height:1.55;color:#222;margin-top:2px}
  .thermal .t-title{font-size:14px;font-weight:700;letter-spacing:.18em;text-align:center;margin:11px 0 3px;color:var(--acc)}
  .thermal .rule{border-top:1px dashed #999;margin:9px 0}
  .thermal .t-kv{display:flex;justify-content:space-between;font-size:11px;padding:2px 0}
  .thermal .t-kv .k{color:#444}.thermal .t-kv .v{font-weight:600;text-align:right}
  .thermal .t-item{padding:5px 0;border-bottom:1px dotted #ccc}
  .thermal .t-item .d{font-size:11.5px;font-weight:600}
  .thermal .t-item .r{display:flex;justify-content:space-between;font-size:11px;color:#333;margin-top:1px}
  .thermal .t-sum{display:flex;justify-content:space-between;font-size:11.5px;padding:2px 0}
  .thermal .t-sum.total{font-size:14px;font-weight:700;border-top:1px solid #000;margin-top:5px;padding-top:6px}
  .thermal .t-words{font-size:10px;font-style:italic;text-align:center;margin-top:8px;color:#333}
  .thermal .t-foot{font-size:10.5px;text-align:center;color:#222;margin-top:10px;line-height:1.6}
  .thermal .t-thanks{font-weight:700;text-align:center;margin-top:8px;font-size:12px}
  `;
  const page = format === "thermal" ? "@page{size:76mm auto;margin:4mm 2mm}" : "@page{size:A4;margin:14mm}";
  return `<!doctype html><html><head><meta charset="utf-8"><title>Print</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>${page}${css}</style></head><body class="${format}">${inner}</body></html>`;
}

function invoiceA4(org: Org, inv: PrintInvoice) {
  const rows = inv.lines.length
    ? inv.lines.map((L, i) => `<tr><td class="n">${i + 1}</td>
        <td><div class="d">${esc(L.desc) || "—"}</div>${L.sub ? `<div class="s">${esc(L.sub)}</div>` : ""}</td>
        <td class="r tnum">${(+L.qty).toLocaleString()}</td><td class="r tnum">${money(L.price)}</td>
        <td class="r tnum">${money(L.qty * L.price)}</td></tr>`).join("")
    : `<tr><td colspan="5" style="padding:16px;color:#98a4b6">No items</td></tr>`;
  const logo = org.logo ? `<img src="${org.logo}" alt="">` : esc(org.mark);
  const showNo = inv.no && inv.no !== "Draft";
  const showStatus = inv.status && inv.status !== "draft";
  const paidRow = inv.paid > 0
    ? `<div><span>Paid</span><span class="tnum">-${money(inv.paid)}</span></div>
       <div class="bal"><span>Balance due</span><span class="tnum">${money(inv.total - inv.paid)}</span></div>` : "";
  const sig = org.sig || org.stamp
    ? `<div class="sigwrap">${org.sig ? `<img class="sig" src="${org.sig}">` : ""}${org.stamp ? `<img class="stamp" src="${org.stamp}">` : ""}</div>` : "";
  return `<div class="doc"><div class="band"></div>
    <div class="head">
      <div><div class="co"><div class="logo">${logo}</div><div class="co-name">${esc(org.name)}</div></div>
        <div class="co-lines">${org.lines.map(esc).join("<br>")}</div></div>
      <div class="meta"><div class="doctype">INVOICE</div>
        <div class="meta-rows">
          ${showNo ? `<div><span>Invoice no</span><b>${esc(inv.no)}</b></div>` : ""}
          <div><span>Issued</span><b>${esc(inv.date)}</b></div>
          <div><span>Due</span><b>${esc(inv.due)}</b></div>
        </div>
        ${showStatus ? `<div class="status">${STATUS[inv.status] || ""}</div>` : ""}
      </div>
    </div>
    <div class="parties">
      <div><div class="lbl">Bill to</div><div class="party">${esc(inv.cust)}</div><div class="party-sub">${esc(inv.custSub || "")}</div></div>
      <div class="due"><div class="lbl">Amount due</div><div class="due-amt tnum">${money(Math.max(0, inv.total - inv.paid))}</div></div>
    </div>
    <table class="items"><thead><tr><th class="n"></th><th>Description</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="lower">
      <div class="words"><div class="wl">Amount in words</div><div class="wv">${esc(nairaWords(inv.total))}</div></div>
      <div class="sumbox">
        <div><span>Subtotal</span><span class="tnum">${money(inv.sub)}</span></div>
        <div><span>Discount</span><span class="tnum">-${money(inv.disc)}</span></div>
        <div><span>VAT (${inv.vatRate}%)</span><span class="tnum">${money(inv.vat)}</span></div>
        <div class="grand"><span>Total</span><span class="tnum">${money(inv.total)}</span></div>
        ${paidRow}
      </div>
    </div>
    <div class="tail">
    <div class="foot">
      <div><div class="lbl">Payment details</div><div class="pay"><b>${esc(org.bank.bank)}</b><br>${esc(org.bank.name)}<br>${esc(org.bank.acct)}</div></div>
      <div><div class="lbl">Terms</div><div class="terms">${esc(org.terms)}</div></div>
    </div>
    <div class="sign"><div class="thanks">${esc(org.thanks)}</div>
      <div>${sig}<div class="sigline">Authorised signature</div></div></div>
    </div>
  </div>`;
}

function invoiceThermal(org: Org, inv: PrintInvoice) {
  const logo = org.logo ? `<img src="${org.logo}" alt="">` : esc(org.mark);
  const items = inv.lines.map((L) => `<div class="t-item"><div class="d">${esc(L.desc)}</div>
      <div class="r"><span>${(+L.qty).toLocaleString()} × ${money(L.price)}</span><span class="tnum">${money(L.qty * L.price)}</span></div></div>`).join("");
  const bal = inv.total - inv.paid;
  const showNo = inv.no && inv.no !== "Draft";
  return `<div class="doc">
    <div class="t-center"><div class="t-logo">${logo}</div><div class="t-name">${esc(org.name)}</div>
      <div class="t-lines">${org.lines.map(esc).join("<br>")}</div></div>
    <div class="t-title">INVOICE</div>
    ${showNo ? `<div class="t-kv"><span class="k">No</span><span class="v">${esc(inv.no)}</span></div>` : ""}
    <div class="t-kv"><span class="k">Date</span><span class="v">${esc(inv.date)}</span></div>
    <div class="t-kv"><span class="k">Bill to</span><span class="v">${esc(inv.cust)}</span></div>
    <div class="rule"></div>${items}
    <div style="margin-top:8px">
      <div class="t-sum"><span>Subtotal</span><span class="tnum">${money(inv.sub)}</span></div>
      <div class="t-sum"><span>Discount</span><span class="tnum">-${money(inv.disc)}</span></div>
      <div class="t-sum"><span>VAT (${inv.vatRate}%)</span><span class="tnum">${money(inv.vat)}</span></div>
      <div class="t-sum total"><span>Total</span><span class="tnum">${money(inv.total)}</span></div>
      ${inv.paid > 0 ? `<div class="t-sum"><span>Paid</span><span class="tnum">-${money(inv.paid)}</span></div><div class="t-sum total"><span>Balance</span><span class="tnum">${money(bal)}</span></div>` : ""}
    </div>
    <div class="t-words">${esc(nairaWords(inv.total))}</div>
    <div class="rule"></div>
    <div class="t-foot"><b>${esc(org.bank.bank)}</b> · ${esc(org.bank.name)}<br>${esc(org.bank.acct)}</div>
    <div class="t-thanks">${esc(org.thanks)}</div>
  </div>`;
}

function receiptA4(org: Org, r: PrintReceipt) {
  const logo = org.logo ? `<img src="${org.logo}" alt="">` : esc(org.mark);
  return `<div class="doc"><div class="band" style="background:linear-gradient(90deg,#0e9f6e,#0b8a5f)"></div>
    <div class="head" style="border-bottom-color:#0e9f6e">
      <div><div class="co"><div class="logo" style="background:linear-gradient(140deg,#0e9f6e,#0b8a5f)">${logo}</div><div class="co-name">${esc(org.name)}</div></div>
        <div class="co-lines">${org.lines.map(esc).join("<br>")}</div></div>
      <div class="meta"><div class="doctype" style="color:#0e9f6e">RECEIPT</div>
        <div class="meta-rows"><div><span>Receipt no</span><b>${esc(r.no)}</b></div><div><span>Date</span><b>${esc(r.date)}</b></div></div></div>
    </div>
    <div class="parties">
      <div><div class="lbl">Received from</div><div class="party">${esc(r.cust)}</div><div class="party-sub">${r.invoiceNo ? "For invoice " + esc(r.invoiceNo) + " · " : ""}${esc(r.method)}</div></div>
      <div class="due"><div class="lbl">Amount received</div><div class="due-amt" style="color:#0e9f6e">${money(r.amount)}</div></div>
    </div>
    <div class="lower">
      <div class="words" style="border-left-color:#0e9f6e"><div class="wl">Amount in words</div><div class="wv">${esc(nairaWords(r.amount))}</div></div>
      <div class="sumbox">
        ${r.total > 0 ? `<div><span>Invoice total</span><span class="tnum">${money(r.total)}</span></div>` : ""}
        <div><span>This payment</span><span class="tnum">${money(r.amount)}</span></div>
        <div class="grand"><span>Balance</span><span class="tnum">${money(r.balance)}</span></div>
      </div>
    </div>
    <div class="sign"><div class="thanks">${esc(org.thanks)}</div>
      <div><div class="sigline">${r.balance <= 0 ? "Paid in full" : "Part payment received"}</div></div></div>
  </div>`;
}

function receiptThermal(org: Org, r: PrintReceipt) {
  const logo = org.logo ? `<img src="${org.logo}" alt="">` : esc(org.mark);
  return `<div class="doc">
    <div class="t-center"><div class="t-logo" style="background:#0e9f6e">${logo}</div><div class="t-name">${esc(org.name)}</div>
      <div class="t-lines">${org.lines.slice(0, 2).map(esc).join("<br>")}</div></div>
    <div class="t-title" style="color:#0e9f6e">RECEIPT</div>
    <div class="t-kv"><span class="k">No</span><span class="v">${esc(r.no)}</span></div>
    <div class="t-kv"><span class="k">Date</span><span class="v">${esc(r.date)}</span></div>
    <div class="t-kv"><span class="k">From</span><span class="v">${esc(r.cust)}</span></div>
    ${r.invoiceNo ? `<div class="t-kv"><span class="k">Invoice</span><span class="v">${esc(r.invoiceNo)}</span></div>` : ""}
    <div class="t-kv"><span class="k">Method</span><span class="v">${esc(r.method)}</span></div>
    <div class="rule"></div>
    <div class="t-sum total"><span>Paid</span><span class="tnum">${money(r.amount)}</span></div>
    ${r.total > 0 ? `<div class="t-sum"><span>Balance</span><span class="tnum">${money(r.balance)}</span></div>` : ""}
    <div class="t-words">${esc(nairaWords(r.amount))}</div>
    <div class="rule"></div>
    <div class="t-thanks">${r.balance <= 0 ? "PAID IN FULL" : "PART PAYMENT"}</div>
    <div class="t-foot">${esc(org.thanks)}</div>
  </div>`;
}

function openAndPrint(html: string) {
  const w = window.open("", "_blank", "width=860,height=960");
  if (!w) { alert("Please allow pop-ups to print."); return; }
  w.document.write(html); w.document.close(); w.focus();
  const go = () => w.print();
  const fonts = (w.document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
  if (fonts?.ready) fonts.ready.then(() => setTimeout(go, 200)); else setTimeout(go, 700);
}

export function printInvoice(org: Org, inv: PrintInvoice, format: PrintFormat) {
  openAndPrint(shell(format === "thermal" ? invoiceThermal(org, inv) : invoiceA4(org, inv), org.acc as [string, string], format));
}
export function printReceipt(org: Org, r: PrintReceipt, format: PrintFormat) {
  openAndPrint(shell(format === "thermal" ? receiptThermal(org, r) : receiptA4(org, r), ["#0e9f6e", "#0b8a5f"], format));
}
