"use client";
import { printInvoice, printReceipt } from "@/lib/print";
import type { Org, ReceiptView } from "@/lib/demo";
import type { InvoiceView } from "@/components/documents";

export function PublicInvoicePrint({ org, inv }: { org: Org; inv: InvoiceView }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "0 0 16px" }}>
      <button className="btn btn-primary btn-sm" onClick={() => printInvoice(org, inv, "a4")}>Download / print (A4)</button>
      <button className="btn btn-white btn-sm" onClick={() => printInvoice(org, inv, "thermal")}>Label</button>
    </div>
  );
}
export function PublicReceiptPrint({ org, rcpt }: { org: Org; rcpt: ReceiptView }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "0 0 16px" }}>
      <button className="btn btn-primary btn-sm" onClick={() => printReceipt(org, rcpt, "a4")}>Download / print (A4)</button>
      <button className="btn btn-white btn-sm" onClick={() => printReceipt(org, rcpt, "thermal")}>Label</button>
    </div>
  );
}
