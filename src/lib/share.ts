// Share invoices / receipts on WhatsApp as PDF, IMAGE, or a public LINK (tap to open).
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { fmt, type Org, type ReceiptView } from "@/lib/demo";
import type { InvoiceView } from "@/components/documents";

export type ShareFormat = "pdf" | "image";

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl; });
}
function pngToPdfBlob(dataUrl: string, wPx: number, hPx: number): Blob {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight(), m = 28;
  const renderW = pageW - m * 2, renderH = renderW * (hPx / wPx), contentH = pageH - m * 2;
  if (renderH <= contentH) { pdf.addImage(dataUrl, "PNG", m, m, renderW, renderH); }
  else { let y = 0, p = 0; while (y < renderH) { if (p > 0) pdf.addPage(); pdf.addImage(dataUrl, "PNG", m, m - y, renderW, renderH); y += contentH; p++; } }
  return pdf.output("blob");
}
async function shareNode(node: HTMLElement | null, base: string, caption: string, format: ShareFormat) {
  if (!node) { window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank"); return; }
  try {
    const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
    let file: File;
    if (format === "pdf") {
      const img = await loadImage(dataUrl);
      file = new File([pngToPdfBlob(dataUrl, img.naturalWidth, img.naturalHeight)], `${base}.pdf`, { type: "application/pdf" });
    } else {
      file = new File([await (await fetch(dataUrl)).blob()], `${base}.png`, { type: "image/png" });
    }
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] }) && navigator.share) { await navigator.share({ files: [file], text: caption }); return; }
    const url = URL.createObjectURL(file);
    const a = document.createElement("a"); a.href = url; a.download = file.name; a.click(); URL.revokeObjectURL(url);
    window.open(`https://wa.me/?text=${encodeURIComponent(caption + `\n\n(The ${format.toUpperCase()} was downloaded — attach it here.)`)}`, "_blank");
  } catch { window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank"); }
}

export async function shareInvoiceWhatsApp(org: Org, inv: InvoiceView, node: HTMLElement | null, format: ShareFormat) {
  const bal = Math.max(0, inv.total - inv.paid);
  const caption = `${org.name} — Invoice ${inv.no}\nTotal ${fmt(inv.total)}${bal > 0 ? `, amount due ${fmt(bal)}` : " (paid in full)"}`;
  await shareNode(node, (inv.no || "invoice").replace(/\s+/g, "-"), caption, format);
}
export async function shareReceiptWhatsApp(org: Org, r: ReceiptView, node: HTMLElement | null, format: ShareFormat) {
  const caption = `${org.name} — Receipt ${r.no}\nAmount received ${fmt(r.amount)}${r.balance > 0 ? `, balance ${fmt(r.balance)}` : ""}`;
  await shareNode(node, (r.no || "receipt").replace(/\s+/g, "-"), caption, format);
}

// Public link (recipient taps → opens the document in their browser, viewable without download)
function siteOrigin() {
  return typeof window !== "undefined" ? window.location.origin : "";
}
export function shareInvoiceLink(org: Org, inv: InvoiceView, id: string, phone?: string) {
  const bal = Math.max(0, inv.total - inv.paid);
  const link = `${siteOrigin()}/view/invoice/${id}`;
  const text = `${org.name} — Invoice ${inv.no}\nTotal ${fmt(inv.total)}${bal > 0 ? `, due ${fmt(bal)}` : " (paid)"}\nView & download: ${link}`;
  openWa(text, phone);
}
export function shareReceiptLink(org: Org, r: ReceiptView, id: string, phone?: string) {
  const link = `${siteOrigin()}/view/receipt/${id}`;
  openWa(`${org.name} — Receipt ${r.no}\nAmount ${fmt(r.amount)}\nView: ${link}`, phone);
}
function openWa(text: string, phone?: string) {
  const d = (phone ?? "").replace(/[^\d]/g, "");
  const num = d ? (d.startsWith("234") ? d : d.replace(/^0/, "234")) : "";
  window.open(`${num ? `https://wa.me/${num}` : "https://wa.me/"}?text=${encodeURIComponent(text)}`, "_blank");
}

// ---- Payment reminders (manual) ----
import type { Invoice } from "@/lib/demo";
export function remindInvoiceWhatsApp(org: Org, inv: Invoice) {
  const bal = Math.max(0, inv.total - inv.paid);
  const link = inv.id ? `${siteOrigin()}/view/invoice/${inv.id}` : "";
  const text = `Hi ${inv.cust}, a friendly reminder that invoice ${inv.no} for ${fmt(bal)} is due ${inv.due || "soon"}.${link ? `\nView & pay details: ${link}` : ""}\n\n— ${org.name}`;
  openWa(text);
}
export function remindInvoiceEmail(org: Org, inv: Invoice) {
  const bal = Math.max(0, inv.total - inv.paid);
  const link = inv.id ? `${siteOrigin()}/view/invoice/${inv.id}` : "";
  const subject = `Reminder: Invoice ${inv.no} from ${org.name}`;
  const body = `Hi ${inv.cust},\n\nThis is a friendly reminder that invoice ${inv.no} for ${fmt(bal)} is due ${inv.due || "soon"}.\n${link ? `\nView it here: ${link}\n` : ""}\nThank you,\n${org.name}`;
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
