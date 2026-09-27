export type Org = {
  name: string;
  mark: string;
  lines: string[];
  bank: { bank: string; name: string; acct: string };
  terms: string;
  thanks: string;
  acc: [string, string];
  logo?: string | null;
  sig?: string | null;
  stamp?: string | null;
};

export type Product = { id?: string; name: string; desc: string; price: number; vat: number };
export type InvoiceStatus = "paid" | "part_paid" | "overdue" | "sent" | "draft" | "void";
export type Invoice = { id?: string; no: string; cust: string; date: string; status: InvoiceStatus; total: number; paid: number; tax: number; due?: string; dueRaw?: string | null };
export type Customer = { id?: string; name: string; email: string; phone: string };
export type Line = { sel: string; desc: string; sub: string; qty: number; price: number };
export type ReceiptView = { no: string; date: string; cust: string; invoiceNo: string; method: string; amount: number; total: number; balance: number };

export const ACCENTS: [string, string][] = [
  ["#0090fc", "#0072d6"],
  ["#4b5bd6", "#3a48b0"],
  ["#0e9f6e", "#0b8a5f"],
  ["#f0a500", "#d18f00"],
  ["#0a2b52", "#061d3b"],
];

export const INITIAL_ORG: Org = {
  name: "Kano Traders Ltd",
  mark: "KT",
  lines: [
    "12 Bompai Road, Kano, Nigeria",
    "+234 803 000 0000 · hello@kanotraders.ng",
    "RC 1234567 · TIN 01234567-0001",
  ],
  bank: { bank: "Zenith Bank", name: "Kano Traders Ltd", acct: "1012345678" },
  terms: "Payment due within 7 days. Goods remain the property of Kano Traders Ltd until paid in full.",
  thanks: "Thank you for your business!",
  acc: ["#0090fc", "#0072d6"],
  logo: null,
  sig: null,
  stamp: null,
};

export const INITIAL_CATALOG: Product[] = [
  { name: "Consulting hour", desc: "Professional services", price: 25000, vat: 7.5 },
  { name: "Delivery", desc: "Within city", price: 3500, vat: 0 },
  { name: "Bag of rice (50kg)", desc: "Premium parboiled", price: 78000, vat: 0 },
  { name: "Branding design", desc: "Logo + identity", price: 150000, vat: 7.5 },
];

export const INITIAL_INVOICES: Invoice[] = [
  { no: "INV-000142", cust: "Zenith Foods", date: "04 Aug 2026", status: "paid", total: 240131, paid: 240131, tax: 0 },
  { no: "INV-000141", cust: "Aliyu Musa", date: "03 Aug 2026", status: "part_paid", total: 120000, paid: 72000, tax: 0 },
  { no: "INV-000140", cust: "Bright Stores", date: "28 Jul 2026", status: "overdue", total: 86000, paid: 0, tax: 0 },
  { no: "INV-000139", cust: "Zenith Foods", date: "26 Jul 2026", status: "sent", total: 54500, paid: 0, tax: 0 },
  { no: "INV-000138", cust: "Halima Sadiq", date: "24 Jul 2026", status: "paid", total: 31000, paid: 31000, tax: 0 },
];

export const CUSTOMERS = [
  { name: "Zenith Foods", email: "accounts@zenithfoods.ng", phone: "0803 111 2222" },
  { name: "Aliyu Musa", email: "—", phone: "0803 000 0000" },
  { name: "Bright Stores", email: "hello@brightstores.ng", phone: "0701 555 4444" },
  { name: "Halima Sadiq", email: "—", phone: "0809 222 3333" },
];

export const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const badgeClass: Record<string, string> = {
  paid: "b-paid", part_paid: "b-part", overdue: "b-overdue", sent: "b-sent", draft: "b-draft", void: "b-void",
};
export const badgeText: Record<string, string> = {
  paid: "paid", part_paid: "part paid", overdue: "overdue", sent: "sent", draft: "draft", void: "void",
};
