"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { ACCENTS } from "@/lib/demo";
import { Icon } from "@/components/icon";
import { InvoiceDocument } from "@/components/documents";
import { readFileAsDataUrl, extractAccent, removeBackground } from "@/lib/image";
import { toast } from "@/lib/toast";

function Dropzone({ id, icon, title, sub, onFile }: { id: string; icon: string; title: string; sub: string; onFile: (f: File) => void }) {
  const ref = useRef<HTMLLabelElement>(null);
  return (
    <label ref={ref} className="dz" id={id}
      onDragOver={(e) => { e.preventDefault(); ref.current?.classList.add("drag"); }}
      onDragLeave={() => ref.current?.classList.remove("drag")}
      onDrop={(e) => { e.preventDefault(); ref.current?.classList.remove("drag"); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}>
      <span className="dzic"><Icon name={icon} /></span>
      <span><span className="dzt">{title}</span><br /><span className="dzs">{sub}</span></span>
      <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </label>
  );
}

export function SettingsPanel() {
  const { org, setOrg, saveOrg, saving } = useStore();
  const [form, setForm] = useState(() => {
    const [phone = "", email = ""] = (org.lines[1] ?? "").split(" · ");
    const [rc = "", tin = ""] = (org.lines[2] ?? "").split(" · ");
    return {
      name: org.name, mark: org.mark, address: org.lines[0] ?? "",
      phone, email, rc, tin,
      bankName: org.bank.bank, acct: org.bank.acct, aName: org.bank.name,
      terms: org.terms, thanks: org.thanks,
    };
  });
  const [accSource, setAccSource] = useState<"logo" | number | null>(0);
  const [detected, setDetected] = useState<[string, string] | null>(null);
  const [sigDone, setSigDone] = useState(false);
  const [stampDone, setStampDone] = useState(false);

  function commit(next: typeof form) {
    setForm(next);
    setOrg({
      name: next.name, mark: next.mark, terms: next.terms, thanks: next.thanks,
      lines: [next.address, `${next.phone} · ${next.email}`, `${next.rc} · ${next.tin}`],
      bank: { bank: next.bankName, name: next.aName, acct: next.acct },
    });
  }
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => commit({ ...form, [k]: e.target.value });

  async function onLogo(f: File) {
    const url = await readFileAsDataUrl(f).catch(() => null);
    if (!url) return toast("Please choose an image file");
    setOrg({ logo: url });
    const img = new Image();
    img.onload = () => {
      const acc = extractAccent(img);
      if (acc) { setOrg({ acc }); setAccSource("logo"); setDetected(acc); }
      toast(acc ? "Logo added — colour set from your logo" : "Logo added");
    };
    img.src = url;
  }
  async function onSig(f: File) { const url = await readFileAsDataUrl(f).catch(() => null); if (!url) return toast("Please choose an image"); setOrg({ sig: url }); setSigDone(false); toast("Signature uploaded"); }
  async function onStamp(f: File) { const url = await readFileAsDataUrl(f).catch(() => null); if (!url) return toast("Please choose an image"); setOrg({ stamp: url }); setStampDone(false); toast("Stamp uploaded"); }
  async function rmBg(kind: "sig" | "stamp") {
    const src = kind === "sig" ? org.sig : org.stamp; if (!src) return;
    toast("Removing background…");
    const out = await removeBackground(src);
    if (kind === "sig") { setOrg({ sig: out }); setSigDone(true); } else { setOrg({ stamp: out }); setStampDone(true); }
    toast("Background removed");
  }
  function pickAccent(i: number) { setOrg({ acc: ACCENTS[i] }); setAccSource(i); }

  return (
    <div className="setgrid">
      <div>
        <div className="scard">
          <div className="sh"><div className="ci"><Icon name="building" /></div><div><h3>Business profile</h3><p>Shown in the header of every invoice &amp; receipt</p></div></div>
          <div className="sb">
            <div className="fld"><label>Business name</label><input className="inp" value={form.name} onChange={set("name")} /></div>
            <div className="fld"><label>Address</label><input className="inp" value={form.address} onChange={set("address")} /></div>
            <div className="grid2">
              <div className="fld"><label>Phone</label><input className="inp" value={form.phone} onChange={set("phone")} /></div>
              <div className="fld"><label>Email</label><input className="inp" value={form.email} onChange={set("email")} /></div>
            </div>
            <div className="grid2">
              <div className="fld"><label>RC number</label><input className="inp" value={form.rc} onChange={set("rc")} /></div>
              <div className="fld"><label>TIN</label><input className="inp" value={form.tin} onChange={set("tin")} /></div>
            </div>
          </div>
        </div>

        <div className="scard">
          <div className="sh"><div className="ci"><Icon name="image" /></div><div><h3>Branding</h3><p>Logo mark &amp; accent colour on your documents</p></div></div>
          <div className="sb">
            <div className="upload">
              <Dropzone id="dz_logo" icon="image" title="Upload your logo" sub="PNG, JPG or SVG · we'll set your invoice colour from it" onFile={onLogo} />
              {org.logo && (
                <div className="uprev" style={{ marginTop: 10 }}>
                  <div className="thumb"><img src={org.logo} alt="" /></div>
                  <div className="meta"><div className="n">Logo added</div><div className="s">{detected ? "Accent colour detected from your logo" : "No strong colour found — pick one below"}</div></div>
                  {detected && <span className="miniswatch" style={{ background: `linear-gradient(140deg,${detected[0]},${detected[1]})` }} />}
                  <button className="chipbtn" onClick={() => { setOrg({ logo: null }); setDetected(null); }}>Remove</button>
                </div>
              )}
            </div>

            <div className="fld"><label>Accent colour {accSource === "logo" && <span style={{ color: "var(--muted)", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>· set from your logo</span>}</label>
              <div className="swatches">
                {ACCENTS.map((a, i) => (
                  <div key={i} className={`sw${accSource === i ? " on" : ""}`} style={{ background: `linear-gradient(140deg,${a[0]},${a[1]})` }} onClick={() => pickAccent(i)} />
                ))}
              </div>
            </div>

            <div className="fld"><label>Logo initials <span style={{ color: "var(--muted)", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>— used if no logo is uploaded</span></label>
              <div className="logopick"><div className="logobox" style={{ ["--acc1" as string]: org.acc[0], ["--acc2" as string]: org.acc[1] } as React.CSSProperties}>{form.mark || "KT"}</div>
                <input className="inp" style={{ maxWidth: 120 }} maxLength={3} value={form.mark} onChange={(e) => commit({ ...form, mark: e.target.value.toUpperCase() })} /></div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "16px 0" }} />

            <div className="upload">
              <Dropzone id="dz_sig" icon="pen" title="Upload signature" sub="Scanned or photographed on white paper" onFile={onSig} />
              {org.sig && (
                <div className="uprev" style={{ marginTop: 10 }}>
                  <div className="thumb"><img src={org.sig} alt="" /></div>
                  <div className="meta"><div className="n">Signature added</div><div className="s">{sigDone ? "Background removed" : "On white background"}</div></div>
                  <button className={`chipbtn${sigDone ? " done" : ""}`} disabled={sigDone} onClick={() => rmBg("sig")}>{sigDone ? <><Icon name="check" /> Done</> : "Remove background"}</button>
                  <button className="chipbtn" onClick={() => { setOrg({ sig: null }); setSigDone(false); }}>Remove</button>
                </div>
              )}
            </div>

            <div className="upload">
              <Dropzone id="dz_stamp" icon="shield" title="Upload stamp / seal" sub="Sits over the signature on your invoice" onFile={onStamp} />
              {org.stamp && (
                <div className="uprev" style={{ marginTop: 10 }}>
                  <div className="thumb"><img src={org.stamp} alt="" /></div>
                  <div className="meta"><div className="n">Stamp added</div><div className="s">{stampDone ? "Background removed" : "On white background"}</div></div>
                  <button className={`chipbtn${stampDone ? " done" : ""}`} disabled={stampDone} onClick={() => rmBg("stamp")}>{stampDone ? <><Icon name="check" /> Done</> : "Remove background"}</button>
                  <button className="chipbtn" onClick={() => { setOrg({ stamp: null }); setStampDone(false); }}>Remove</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="scard">
          <div className="sh"><div className="ci"><Icon name="bank" /></div><div><h3>Payment details &amp; footer</h3><p>Bank info, terms and thank-you note in the footer</p></div></div>
          <div className="sb">
            <div className="grid2">
              <div className="fld"><label>Bank</label><input className="inp" value={form.bankName} onChange={set("bankName")} /></div>
              <div className="fld"><label>Account number</label><input className="inp" value={form.acct} onChange={set("acct")} /></div>
            </div>
            <div className="fld"><label>Account name</label><input className="inp" value={form.aName} onChange={set("aName")} /></div>
            <div className="fld"><label>Terms</label><input className="inp" value={form.terms} onChange={set("terms")} /></div>
            <div className="fld"><label>Thank-you note</label><input className="inp" value={form.thanks} onChange={set("thanks")} /></div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" disabled={saving} onClick={() => { saveOrg(); toast("Settings saved — applied to all future invoices"); }}><Icon name="check" /> {saving ? "Saving…" : "Save changes"}</button>
          <button className="btn btn-white">Cancel</button>
        </div>
      </div>

      <div>
        <div className="setprev">
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>Live preview</div>
          <InvoiceDocument org={org} inv={{
            no: "INV-000143", date: "05 Aug 2026", due: "12 Aug 2026", status: "sent",
            cust: "Zenith Foods", custSub: "accounts@zenithfoods.ng",
            lines: [
              { desc: "Bag of rice (50kg)", sub: "Premium parboiled", qty: 2, price: 78000 },
              { desc: "Consulting hour", sub: "Professional services", qty: 3, price: 25000 },
            ], sub: 231000, disc: 0, vatRate: 7.5, vat: 17325, total: 248325, paid: 0,
          }} />
          <div className="previewcap">Your changes appear on the invoice instantly</div>
        </div>
      </div>
    </div>
  );
}
