import { createClient } from "@/lib/supabase/server";
import type { Org, Product, Invoice, InvoiceStatus } from "@/lib/demo";

export type Customer = { id?: string; name: string; email: string; phone: string };
export type Workspace = {
  org: Org;
  catalog: Product[];
  invoices: Invoice[];
  customers: Customer[];
  email: string | null;
};

function fmtDate(d: string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// row shapes are loose (Supabase returns any); keep mapping defensive
/* eslint-disable @typescript-eslint/no-explicit-any */
function mapOrg(o: any): Org {
  const line = (a?: string, b?: string) => [a, b].filter(Boolean).join(" · ");
  return {
    name: o.name ?? "My Business",
    mark: o.mark ?? "MB",
    lines: [o.address ?? "", line(o.phone, o.email), line(o.rc, o.tin)].filter(Boolean),
    bank: { bank: o.bank_name ?? "", name: o.bank_acct_name ?? "", acct: o.bank_acct_no ?? "" },
    terms: o.terms ?? "",
    thanks: o.thanks ?? "Thank you for your business!",
    acc: [o.accent1 ?? "#0090fc", o.accent2 ?? "#0072d6"],
    logo: o.logo_url ?? null,
    sig: o.signature_url ?? null,
    stamp: o.stamp_url ?? null,
  };
}

function mapInvoice(i: any): Invoice & { id: string } {
  const dueRaw = i.due_date ?? null;
  let status = (i.status ?? "draft") as InvoiceStatus;
  const paid = Number(i.amount_paid ?? 0);
  const total = Number(i.total ?? 0);
  if ((status === "sent" || status === "part_paid") && dueRaw && new Date(dueRaw) < new Date() && paid < total) {
    status = "overdue";
  }
  return {
    id: i.id,
    no: i.number ?? "Draft",
    cust: i.customer_name ?? "—",
    date: fmtDate(i.issue_date),
    status,
    total,
    paid,
    tax: Number(i.tax ?? 0),
    due: fmtDate(dueRaw),
    dueRaw,
  };
}

export async function getWorkspace(): Promise<Workspace | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: mem } = await supabase.from("memberships").select("org_id").limit(1).maybeSingle();
  const orgId = mem?.org_id as string | undefined;
  if (!orgId) return null;

  const [{ data: o }, { data: products }, { data: custs }, { data: invs }] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", orgId).single(),
    supabase.from("products").select("*").order("created_at"),
    supabase.from("customers").select("*").order("created_at"),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
  ]);

  return {
    org: mapOrg(o ?? {}),
    catalog: (products ?? []).map((p: any) => ({
      id: p.id, name: p.name, desc: p.description ?? "", price: Number(p.unit_price), vat: Number(p.tax_rate),
    })),
    customers: (custs ?? []).map((c: any) => ({
      id: c.id, name: c.name, email: c.email || "—", phone: c.phone || "—",
    })),
    invoices: (invs ?? []).map(mapInvoice),
    email: user.email ?? null,
  };
}

export type ReceiptRow = { id: string; no: string; date: string; cust: string; amount: number; method: string; invoiceNo: string };

export async function getReceipts(): Promise<ReceiptRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("receipts")
    .select("*, invoices(number, customer_name)")
    .order("issued_at", { ascending: false });
  return (data ?? []).map((r: any) => ({
    id: r.id,
    no: r.number ?? "",
    date: fmtDate(r.issued_at),
    amount: Number(r.amount ?? 0),
    method: r.method ?? "",
    cust: r.customer_name ?? r.invoices?.customer_name ?? "—",
    invoiceNo: r.invoices?.number ?? "",
  }));
}
