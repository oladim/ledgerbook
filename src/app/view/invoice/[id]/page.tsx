import { notFound } from "next/navigation";
import { getPublicInvoice } from "@/server/public-data";
import { InvoiceDocument } from "@/components/documents";
import { PublicInvoicePrint } from "@/components/public-print";

export const dynamic = "force-dynamic";

export default async function PublicInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPublicInvoice(id);
  if (!data) notFound();
  return (
    <div className="viewwrap">
      <div className="viewcard">
        <PublicInvoicePrint org={data.org} inv={data.inv} />
        <InvoiceDocument org={data.org} inv={data.inv} />
      </div>
    </div>
  );
}
