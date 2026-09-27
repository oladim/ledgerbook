"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import type { Org, Product, Invoice, Customer, ReceiptView } from "@/lib/demo";
import {
  createProductAction, createCustomerAction, saveOrgAction, recordPaymentAction, voidInvoiceAction,
} from "@/server/actions";

export type Workspace = { org: Org; catalog: Product[]; invoices: Invoice[]; customers: Customer[]; email: string | null };

type Store = {
  org: Org; email: string | null;
  setOrg: (patch: Partial<Org>) => void;
  saveOrg: () => void; saving: boolean;
  catalog: Product[]; addProduct: (p: Product) => void;
  customers: Customer[]; addCustomer: (c: Customer) => void;
  invoices: Invoice[];
  recordPayment: (id: string, amount: number, method: string) => Promise<void>;
  voidInvoice: (id: string, reason: string) => Promise<void>;
  receipt: ReceiptView | null;
  showReceipt: (r: ReceiptView) => void;
  showInvoiceReceipt: (inv: Invoice) => void;
  closeReceipt: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ initial, children }: { initial: Workspace; children: React.ReactNode }) {
  const [org, setOrgState] = useState<Org>(initial.org);
  const [catalog, setCatalog] = useState<Product[]>(initial.catalog);
  const [customers, setCustomers] = useState<Customer[]>(initial.customers);
  const [invoices, setInvoices] = useState<Invoice[]>(initial.invoices);
  const [receipt, setReceipt] = useState<ReceiptView | null>(null);
  const [saving, startSaving] = useTransition();

  const setOrg = useCallback((patch: Partial<Org>) => setOrgState((o) => ({ ...o, ...patch })), []);
  const saveOrg = useCallback(() => { startSaving(() => saveOrgAction(org)); }, [org]);

  const addProduct = useCallback((p: Product) => {
    setCatalog((c) => [...c, p]);
    createProductAction({ name: p.name, desc: p.desc, price: p.price, vat: p.vat });
  }, []);

  const addCustomer = useCallback((c: Customer) => {
    setCustomers((cs) => [...cs, c]);
    createCustomerAction({ name: c.name, email: c.email === "—" ? "" : c.email, phone: c.phone === "—" ? "" : c.phone });
  }, []);

  const recordPayment = useCallback(async (id: string, amount: number, method: string) => {
    const r = await recordPaymentAction(id, amount, method);
    setInvoices((inv) => inv.map((i) => {
      if (i.id !== id) return i;
      const paid = Math.min(i.total, i.paid + amount);
      return { ...i, paid, status: paid >= i.total ? "paid" : "part_paid" };
    }));
    setReceipt(r);
  }, []);

  const showReceipt = useCallback((r: ReceiptView) => setReceipt(r), []);
  const voidInvoice = useCallback(async (id: string, reason: string) => {
    await voidInvoiceAction(id, reason);
    setInvoices((inv) => inv.map((i) => (i.id === id ? { ...i, status: "void" } : i)));
  }, []);
  const closeReceipt = useCallback(() => setReceipt(null), []);
  const showInvoiceReceipt = useCallback((inv: Invoice) => setReceipt({
    no: `RCP-${inv.no.split("-")[1] ?? ""}`, date: inv.date, cust: inv.cust, invoiceNo: inv.no,
    method: "Bank transfer", amount: inv.paid, total: inv.total, balance: Math.max(0, inv.total - inv.paid),
  }), []);

  const value = useMemo<Store>(() => ({
    org, email: initial.email, setOrg, saveOrg, saving,
    catalog, addProduct, customers, addCustomer, invoices,
    recordPayment, voidInvoice, receipt, showReceipt, showInvoiceReceipt, closeReceipt,
  }), [org, initial.email, setOrg, saveOrg, saving, catalog, addProduct, customers, addCustomer, invoices, recordPayment, voidInvoice, receipt, showReceipt, showInvoiceReceipt, closeReceipt]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
