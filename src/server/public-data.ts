import { adminClient } from "@/lib/supabase/admin";
import type { InvoiceView } from "@/components/documents";
import type { Org, ReceiptView } from "@/lib/demo";

/* eslint-disable @typescript-eslint/no-explicit-any */
function fmtDate(d: string | null) { if (!d) return ""; const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
function mapOrg(o: any): Org {
  const line = (a?: string, b?: string) => [a, b].filter(Boolean).join(" · ");
  return {
    name: o.name ?? "Business", mark: o.mark ?? "MB",
    lines: [o.address ?? "", line(o.phone, o.email), line(o.rc, o.tin)].filter(Boolean),
    bank: { bank: o.bank_name ?? "", name: o.bank_acct_name ?? "", acct: o.bank_acct_no ?? "" },
    terms: o.terms ?? "", thanks: o.thanks ?? "Thank you for your business!",
    acc: [o.accent1 ?? "#0090fc", o.accent2 ?? "#0072d6"],
    logo: o.logo_url ?? null, sig: o.signature_url ?? null, stamp: o.stamp_url ?? null,
  };
}

export async function getPublicInvoice(id: string): Promise<{ org: Org; inv: InvoiceView } | null> {
  const db = adminClient();
  const { data: i } = await db.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!i) return null;
  const { data: o } = await db.from("organizations").select("*").eq("id", i.org_id).maybeSingle();
  const { data: items } = await db.from("invoice_items").select("*").eq("invoice_id", id).order("position");
  const sub = Number(i.subtotal ?? 0), disc = Number(i.discount ?? 0), vat = Number(i.tax ?? 0);
  const base = sub - disc;
  return {
    org: mapOrg(o ?? {}),
    inv: {
      no: i.number ?? "Draft", date: fmtDate(i.issue_date), due: fmtDate(i.due_date) || "On receipt",
      status: i.status ?? "draft", cust: i.customer_name ?? "—", custSub: i.customer_sub ?? "", voidReason: i.void_reason ?? "",
      lines: (items ?? []).map((it: any) => ({ desc: it.description, sub: it.sub ?? "", qty: Number(it.quantity), price: Number(it.unit_price) })),
      sub, disc, vatRate: base > 0 ? Math.round((vat / base) * 1000) / 10 : 0, vat, total: Number(i.total ?? 0), paid: Number(i.amount_paid ?? 0),
    },
  };
}

export async function getPublicReceipt(id: string): Promise<{ org: Org; rcpt: ReceiptView } | null> {
  const db = adminClient();
  const { data: r } = await db.from("receipts").select("*, invoices(number, customer_name, total, amount_paid)").eq("id", id).maybeSingle();
  if (!r) return null;
  const { data: o } = await db.from("organizations").select("*").eq("id", r.org_id).maybeSingle();
  const invTotal = Number((r as any).invoices?.total ?? 0);
  const invPaid = Number((r as any).invoices?.amount_paid ?? 0);
  return {
    org: mapOrg(o ?? {}),
    rcpt: {
      no: r.number ?? "", date: fmtDate(r.issued_at), cust: (r as any).customer_name ?? (r as any).invoices?.customer_name ?? "—",
      invoiceNo: (r as any).invoices?.number ?? "", method: r.method ?? "", amount: Number(r.amount ?? 0),
      total: invTotal, balance: Math.max(0, invTotal - invPaid),
    },
  };
}
