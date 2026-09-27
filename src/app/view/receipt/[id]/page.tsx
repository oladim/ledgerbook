import { notFound } from "next/navigation";
import { getPublicReceipt } from "@/server/public-data";
import { ReceiptDocument } from "@/components/documents";
import { PublicReceiptPrint } from "@/components/public-print";

export const dynamic = "force-dynamic";

export default async function PublicReceipt({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPublicReceipt(id);
  if (!data) notFound();
  return (
    <div className="viewwrap">
      <div className="viewcard">
        <PublicReceiptPrint org={data.org} rcpt={data.rcpt} />
        <ReceiptDocument org={data.org} rcpt={data.rcpt} />
      </div>
    </div>
  );
}
