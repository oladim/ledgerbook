import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspace } from "@/server/data";
import { getInvoiceDetailAction } from "@/server/actions";
import { InvoiceDocument } from "@/components/documents";
import { InvoiceActions } from "@/components/invoice-actions";

export default async function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ws = await getWorkspace();
  if (!ws) notFound();
  const inv = await getInvoiceDetailAction(id);

  return (
    <div className="invview">
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href="/invoices" style={{ color: "var(--muted)", fontSize: 13.5 }}>← Invoices</Link>
        <InvoiceActions org={ws.org} inv={inv} id={id} />
      </div>
      <div className="invview-doc">
        <InvoiceDocument org={ws.org} inv={inv} />
      </div>
    </div>
  );
}
