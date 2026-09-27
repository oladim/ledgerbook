"use client";

import { useStore } from "@/lib/store";
import { fmt } from "@/lib/demo";
import { Icon } from "@/components/icon";
import { remindInvoiceWhatsApp, remindInvoiceEmail } from "@/lib/share";
import { sendReminderEmailAction } from "@/server/actions";
import { toast } from "@/lib/toast";

function daysBetween(due: string | null | undefined): number | null {
  if (!due) return null;
  const d = new Date(due); if (isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - Date.now()) / 86400000);
}

export default function Reminders() {
  const { org, invoices } = useStore();

  async function emailRemind(inv: (typeof invoices)[number]) {
    if (!inv.id) return;
    const to = window.prompt("Send reminder to which email address?", "");
    if (!to) return;
    const res = await sendReminderEmailAction(inv.id, to);
    if (res.ok) toast("Reminder email sent");
    else if (res.error === "not_configured") { remindInvoiceEmail(org, inv); toast("Opened your mail app (server email not configured)"); }
    else toast(res.error || "Could not send email");
  }
  const outstanding = invoices
    .filter((i) => (i.status === "sent" || i.status === "part_paid" || i.status === "overdue") && i.total - i.paid > 0)
    .sort((a, b) => (a.dueRaw || "9999").localeCompare(b.dueRaw || "9999"));

  return (
    <div>
      <div className="scard" style={{ maxWidth: 900 }}>
        <div className="sh"><div className="ci"><Icon name="card" /></div>
          <div><h3>Payments due</h3><p>Send a reminder on WhatsApp or by email. {outstanding.length} outstanding.</p></div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16, maxWidth: 900 }}>
        <table className="data">
          <thead><tr><th>Invoice</th><th>Customer</th><th>Due</th><th className="r">Balance</th><th className="r">Remind</th></tr></thead>
          <tbody>
            {outstanding.length === 0 && <tr><td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}>No outstanding invoices. 🎉</td></tr>}
            {outstanding.map((inv) => {
              const d = daysBetween(inv.dueRaw);
              const label = d == null ? "—" : d < 0 ? `${-d}d overdue` : d === 0 ? "due today" : `in ${d}d`;
              const overdue = d != null && d < 0;
              return (
                <tr key={inv.id ?? inv.no}>
                  <td className="tnum" style={{ fontWeight: 600 }}>{inv.no}</td>
                  <td>{inv.cust}</td>
                  <td><span style={{ color: overdue ? "var(--amber)" : "var(--muted)", fontWeight: overdue ? 600 : 400 }}>{inv.due || "—"} · {label}</span></td>
                  <td className="r tnum">{fmt(inv.total - inv.paid)}</td>
                  <td className="r" style={{ whiteSpace: "nowrap" }}>
                    <span className="link" onClick={() => remindInvoiceWhatsApp(org, inv)}>WhatsApp</span>
                    <span style={{ color: "var(--line)", margin: "0 8px" }}>|</span>
                    <span className="link" onClick={() => emailRemind(inv)}>Email</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="scard" style={{ maxWidth: 900, marginTop: 16 }}>
        <div className="sh"><div className="ci"><Icon name="shield" /></div>
          <div><h3>Automatic reminders <span style={{ fontSize: 11, color: "var(--gold-2)", fontWeight: 700 }}>PRO</span></h3>
            <p>Scheduled reminders that go out automatically before and after the due date. Requires a scheduler + email/WhatsApp provider — ask us to enable it for your workspace.</p></div>
        </div>
      </div>
    </div>
  );
}
