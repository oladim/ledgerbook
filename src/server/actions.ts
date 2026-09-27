"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Org } from "@/lib/demo";
import type { InvoiceView } from "@/components/documents";
import type { ReceiptView } from "@/lib/demo";
import { PRICING } from "@/lib/pricing";

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: mem } = await supabase.from("memberships").select("org_id").limit(1).maybeSingle();
  const orgId = mem?.org_id as string | undefined;
  if (!orgId) throw new Error("No workspace");
  return { supabase, orgId };
}

const fmtDate = (d: string | null) => {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const vatRateOf = (sub: number, disc: number, vat: number) => {
  const base = sub - disc;
  return base > 0 ? Math.round((vat / base) * 1000) / 10 : 0;
};

export async function createProductAction(input: { name: string; desc: string; price: number; vat: number }) {
  const { supabase, orgId } = await ctx();
  await supabase.from("products").insert({ org_id: orgId, name: input.name, description: input.desc, unit_price: input.price, tax_rate: input.vat });
  revalidatePath("/items"); revalidatePath("/invoices/new");
}

export async function createCustomerAction(input: { name: string; email: string; phone: string }) {
  const { supabase, orgId } = await ctx();
  await supabase.from("customers").insert({ org_id: orgId, name: input.name, email: input.email || null, phone: input.phone || null });
  revalidatePath("/customers"); revalidatePath("/invoices/new");
}

export async function saveOrgAction(org: Org) {
  const { supabase, orgId } = await ctx();
  const [phone = "", email = ""] = (org.lines[1] ?? "").split(" · ");
  const [rc = "", tin = ""] = (org.lines[2] ?? "").split(" · ");
  await supabase.from("organizations").update({
    name: org.name, mark: org.mark, address: org.lines[0] ?? "", phone, email, rc, tin,
    bank_name: org.bank.bank, bank_acct_name: org.bank.name, bank_acct_no: org.bank.acct,
    terms: org.terms, thanks: org.thanks, accent1: org.acc[0], accent2: org.acc[1],
    logo_url: org.logo ?? null, signature_url: org.sig ?? null, stamp_url: org.stamp ?? null,
  }).eq("id", orgId);
  revalidatePath("/settings"); revalidatePath("/invoices/new");
}

type NewLine = { desc: string; sub: string; qty: number; price: number };

export async function createInvoiceAction(input: {
  customerName: string; customerSub: string; discount: number; vatRate: number; dueDate?: string; lines: NewLine[];
}): Promise<{ ok: true; id: string; no: string } | { ok: false; error: string }> {
  const { supabase, orgId } = await ctx();
  const subtotal = input.lines.reduce((s, l) => s + l.qty * l.price, 0);
  const discount = Math.min(input.discount || 0, subtotal);
  const vat = Math.round((subtotal - discount) * (input.vatRate / 100) * 100) / 100;
  const total = subtotal - discount + vat;

  const { data: org } = await supabase.from("organizations")
    .select("invoice_prefix,invoice_counter,plan,plan_status,plan_expires").eq("id", orgId).single();
  const paidPlan = !!org?.plan && org.plan !== "free" && org.plan_status === "active" &&
    (!org.plan_expires || new Date(org.plan_expires) > new Date());
  if (!paidPlan && (org?.invoice_counter ?? 0) >= 5) {
    return { ok: false as const, error: "FREE_LIMIT" };
  }
  const seq = (org?.invoice_counter ?? 0) + 1;
  const number = `${org?.invoice_prefix ?? "INV"}-${String(seq).padStart(6, "0")}`;
  await supabase.from("organizations").update({ invoice_counter: seq }).eq("id", orgId);

  const { data: inv } = await supabase.from("invoices").insert({
    org_id: orgId, number, number_seq: seq,
    customer_name: input.customerName, customer_sub: input.customerSub,
    status: "sent", subtotal, discount, tax: vat, total, amount_paid: 0, due_date: input.dueDate || null,
  }).select("id").single();

  const invoiceId = inv!.id as string;
  await supabase.from("invoice_items").insert(input.lines.map((l, i) => ({
    invoice_id: invoiceId, org_id: orgId, description: l.desc, sub: l.sub,
    quantity: l.qty, unit_price: l.price, tax_rate: 0, amount: l.qty * l.price, position: i,
  })));

  revalidatePath("/invoices"); revalidatePath("/overview");
  return { ok: true as const, id: invoiceId, no: number };
}

// ---------------- Billing (Paystack) ----------------
export async function initPaystackAction(plan: "basic" | "pro", cycle: "month" | "year"):
  Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const { supabase, orgId } = await ctx();
  const { data: { user } } = await supabase.auth.getUser();
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return { ok: false, error: "Billing is not configured (missing PAYSTACK_SECRET_KEY)." };
  const amount = (PRICING[plan]?.[cycle] ?? 0) * 100; // kobo
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user?.email, amount,
        callback_url: `${site}/billing/verify`,
        metadata: { orgId, plan, cycle },
      }),
    });
    const j = await res.json();
    if (j.status && j.data?.authorization_url) return { ok: true, url: j.data.authorization_url };
    return { ok: false, error: j.message || "Could not start payment" };
  } catch {
    return { ok: false, error: "Network error starting payment" };
  }
}

export async function getPlanInfo(): Promise<{ plan: string; status: string; expires: string | null; used: number; limit: number | null }> {
  const { supabase, orgId } = await ctx();
  const { data: org } = await supabase.from("organizations").select("plan,plan_status,plan_expires,invoice_counter").eq("id", orgId).single();
  const paidPlan = !!org?.plan && org.plan !== "free" && org.plan_status === "active" && (!org.plan_expires || new Date(org.plan_expires) > new Date());
  return {
    plan: org?.plan ?? "free", status: org?.plan_status ?? "active", expires: org?.plan_expires ?? null,
    used: org?.invoice_counter ?? 0, limit: paidPlan ? null : 5,
  };
}

export async function getInvoiceDetailAction(invoiceId: string): Promise<InvoiceView> {
  const { supabase } = await ctx();
  const { data: inv } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();
  const { data: items } = await supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId).order("position");
  const sub = Number(inv?.subtotal ?? 0), disc = Number(inv?.discount ?? 0), vat = Number(inv?.tax ?? 0);
  return {
    no: inv?.number ?? "Draft", date: fmtDate(inv?.issue_date), due: fmtDate(inv?.due_date) || "On receipt",
    status: inv?.status ?? "draft", cust: inv?.customer_name ?? "—", custSub: inv?.customer_sub ?? "",
    lines: (items ?? []).map((it) => ({ desc: it.description, sub: it.sub ?? "", qty: Number(it.quantity), price: Number(it.unit_price) })),
    sub, disc, vatRate: vatRateOf(sub, disc, vat), vat, total: Number(inv?.total ?? 0), paid: Number(inv?.amount_paid ?? 0),
    voidReason: inv?.void_reason ?? "",
  };
}

export async function recordPaymentAction(invoiceId: string, amount: number, method: string): Promise<ReceiptView> {
  const { supabase, orgId } = await ctx();
  const { data: inv } = await supabase.from("invoices").select("total,amount_paid,number,customer_name").eq("id", invoiceId).single();
  const total = Number(inv?.total ?? 0);
  const newPaid = Math.min(total, Number(inv?.amount_paid ?? 0) + amount);
  const status = newPaid >= total ? "paid" : "part_paid";
  await supabase.from("invoices").update({ amount_paid: newPaid, status }).eq("id", invoiceId);

  const rno = `RCP-${(inv?.number ?? "").split("-")[1] ?? String(Date.now()).slice(-6)}`;
  await supabase.from("receipts").insert({ org_id: orgId, invoice_id: invoiceId, number: rno, amount, method });

  revalidatePath("/invoices"); revalidatePath("/overview");
  return {
    no: rno, date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    cust: inv?.customer_name ?? "—", invoiceNo: inv?.number ?? "", method,
    amount, total, balance: Math.max(0, total - newPaid),
  };
}

export async function createReceiptAction(input: {
  cust: string; amount: number; method: string; description: string;
}): Promise<ReceiptView> {
  const { supabase, orgId } = await ctx();
  const rno = `RCP-${String(Date.now()).slice(-6)}`;
  // customer_name/description require the receipts migration; fall back if absent.
  const full = await supabase.from("receipts").insert({
    org_id: orgId, invoice_id: null, number: rno, amount: input.amount, method: input.method,
    customer_name: input.cust, description: input.description,
  });
  if (full.error) {
    await supabase.from("receipts").insert({ org_id: orgId, invoice_id: null, number: rno, amount: input.amount, method: input.method });
  }
  revalidatePath("/receipts");
  return {
    no: rno, date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    cust: input.cust || "—", invoiceNo: "", method: input.method, amount: input.amount, total: 0, balance: 0,
  };
}

export async function voidInvoiceAction(invoiceId: string, reason: string) {
  const { supabase } = await ctx();
  await supabase.from("invoices").update({ status: "void", void_reason: reason || null, voided_at: new Date().toISOString() }).eq("id", invoiceId);
  revalidatePath("/invoices"); revalidatePath("/overview"); revalidatePath("/reminders");
}

export async function sendReminderEmailAction(invoiceId: string, to: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase, orgId } = await ctx();
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "not_configured" };
  if (!to || !/^\S+@\S+\.\S+$/.test(to)) return { ok: false, error: "Enter a valid email address" };

  const [{ data: inv }, { data: org }] = await Promise.all([
    supabase.from("invoices").select("number,customer_name,total,amount_paid,due_date").eq("id", invoiceId).single(),
    supabase.from("organizations").select("name").eq("id", orgId).single(),
  ]);
  const bal = Number(inv?.total ?? 0) - Number(inv?.amount_paid ?? 0);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const link = site ? `${site}/view/invoice/${invoiceId}` : "";
  const due = inv?.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "soon";
  const amount = "\u20a6" + bal.toLocaleString("en-NG", { minimumFractionDigits: 2 });
  const from = process.env.EMAIL_FROM;
  const subject = `Reminder: Invoice ${inv?.number ?? ""} from ${org?.name ?? "us"}`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
    <p>Hi ${inv?.customer_name ?? "there"},</p>
    <p>This is a friendly reminder that invoice <b>${inv?.number ?? ""}</b> for <b>${amount}</b> is due <b>${due}</b>.</p>
    ${link ? `<p><a href="${link}" style="background:#0090fc;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">View invoice</a></p>` : ""}
    <p>Thank you,<br>${org?.name ?? ""}</p></div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) return { ok: false, error: (await res.text()).slice(0, 180) };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error sending email" };
  }
}
