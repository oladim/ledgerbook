import Link from "next/link";
import { getReceipts } from "@/server/data";
import { Icon } from "@/components/icon";
import { ReceiptsTable } from "@/components/receipts-table";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const rows = await getReceipts();
  return (
    <div className="panel" style={{ marginTop: 0 }}>
      <div className="ph"><h3>Receipts</h3><Link className="btn btn-primary btn-sm" href="/receipts/new"><Icon name="plus" /> New receipt</Link></div>
      <ReceiptsTable rows={rows} />
    </div>
  );
}
