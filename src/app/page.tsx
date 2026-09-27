import Link from "next/link";
import { Icon } from "@/components/icon";
import { InvoiceDocument } from "@/components/documents";
import { INITIAL_ORG } from "@/lib/demo";

const heroInvoice = {
  no: "INV-000142", date: "04 Aug 2026", due: "On receipt", status: "paid",
  cust: "Zenith Foods", custSub: "accounts@zenithfoods.ng",
  lines: [
    { desc: "Bag of rice (50kg)", sub: "Premium parboiled", qty: 2, price: 78000 },
    { desc: "Delivery", sub: "Within city", qty: 1, price: 3500 },
    { desc: "Consulting hour", sub: "Professional services", qty: 3, price: 25000 },
  ],
  sub: 234500, disc: 0, vatRate: 7.5, vat: 17587.5, total: 252087.5, paid: 252087.5,
};

const features = [
  { i: "tag", t: "Item catalog", p: "Save your products and prices once. Pick them from a dropdown on any invoice — price and VAT fill themselves." },
  { i: "send", t: "Send on WhatsApp", p: "One tap sends a clean invoice with a pay link — right where your customers already are.", feat: true },
  { i: "image", t: "Branded invoices", p: "Your logo, full address, contact and RC/TIN on a proper header and footer — looks like your business." },
  { i: "card", t: "Track & get paid", p: "See paid, part-paid and overdue at a glance. Record payments and generate a receipt in one click." },
  { i: "pen", t: "Paper mode", p: "Upload your existing invoice book and fill it digitally — type or write with a stylus." },
  { i: "shield", t: "e-Invoicing ready", p: "Built for the FIRS/NRS mandate, so you stay compliant when it reaches your business." },
];

export default function Landing() {
  return (
    <div>
      <header className="lnav"><div className="wrap row">
        <div className="brand"><span className="seal">Lb</span> Ledgerbook</div>
        <nav><a>Features</a><a>Pricing</a><a>e-Invoicing</a><a>Support</a></nav>
        <div className="cta">
          <Link className="btn btn-ghost btn-sm" href="/signin">Sign in</Link>
          <Link className="btn btn-gold btn-sm" href="/signin">Start free</Link>
        </div>
      </div></header>

      <div className="hero"><div className="hero-bg" /><div className="wrap hero-grid">
        <div>
          <span className="eyebrow"><span className="d" /> For traders, agencies &amp; SMEs</span>
          <h1>Your invoice book,<br />except it <em>gets you paid.</em></h1>
          <p className="lead">Create branded invoices in seconds, send them on WhatsApp, track every naira, and stay ready for FIRS e-invoicing — online or off.</p>
          <div className="cta">
            <Link className="btn btn-primary" href="/signin">Start free <Icon name="arrow" /></Link>
            <Link className="btn btn-white" href="/overview">See the app</Link>
          </div>
          <div className="microtrust"><span className="dot" /> No card needed · Free plan forever · Set up in 3 minutes</div>
        </div>
        <div className="paper-stage">
          <div className="hero-doc"><InvoiceDocument org={INITIAL_ORG} inv={heroInvoice} /></div>
          <div className="float wa"><span className="chip"><Icon name="send" /></span> Sent on WhatsApp · seen 2:14pm</div>
          <div className="float paid"><span className="chip"><Icon name="check" /></span> Paid in full</div>
        </div>
      </div></div>

      <div className="trust"><div className="wrap">
        <span className="pill">Pay with <b>Paystack</b> &amp; <b>Flutterwave</b></span>
        <span className="pill"><Icon name="send" /> Send on <b>WhatsApp</b></span>
        <span className="pill"><Icon name="shield" /> <b>FIRS / NRS</b> ready</span>
        <span className="pill"><Icon name="wifi-off" /> Works <b>offline</b></span>
        <span className="pill">Made in <b>Nigeria</b> 🇳🇬</span>
      </div></div>

      <section className="blk"><div className="wrap">
        <div className="sec-head">
          <div className="kicker">Everything you invoice with, in one place</div>
          <h2>From first item to money in the bank.</h2>
          <p>Save what you sell, drop items onto an invoice, send it, and watch it get paid — the whole loop, without the paperwork.</p>
        </div>
        <div className="features">
          {features.map((f) => (
            <div key={f.t} className={`fcard${f.feat ? " feat" : ""}`}>
              <div className="ficon"><Icon name={f.i} /></div>
              <h3>{f.t}</h3><p>{f.p}</p>
            </div>
          ))}
        </div>
      </div></section>

      <section className="blk" style={{ paddingTop: 0 }}><div className="wrap"><div className="showcase">
        <div>
          <h2>Still using a carbon-copy invoice book?</h2>
          <p>Keep the habit. Lose the lost copies, the maths errors, and the &quot;which invoice was that?&quot; Upload your existing book and we recreate it — fillable, digital, yours.</p>
          <ul>
            <li><Icon name="check" /> Type the details or write with a pen/stylus, just like paper</li>
            <li><Icon name="check" /> Every copy saved, searchable, and backed up</li>
            <li><Icon name="check" /> Handwriting turns into real numbers you can report on</li>
          </ul>
          <Link className="btn btn-gold" style={{ marginTop: 24 }} href="/signin">Try paper mode</Link>
        </div>
        <div className="writingpad">
          <div style={{ fontWeight: 700, color: "var(--ink)" }}>Receipt</div>
          <div className="lines" /><div className="lines" /><div className="lines" /><div className="lines" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 13 }}><span style={{ color: "var(--muted)" }}>Total</span><span className="tnum" style={{ fontWeight: 600 }}>₦42,500</span></div>
          <span className="hand" style={{ right: 34, top: 66, fontSize: 18 }}>Aliyu M.</span>
          <span className="hand" style={{ right: 26, bottom: 20, fontSize: 15, color: "var(--gold-2)" }}>✓ paid</span>
        </div>
      </div></div></section>

      <section className="blk" style={{ paddingTop: 0 }}><div className="wrap">
        <div className="sec-head" style={{ textAlign: "center", margin: "0 auto 44px" }}>
          <div className="kicker">Simple pricing</div>
          <h2>Start free. Upgrade when you&apos;re getting paid.</h2>
        </div>
        <div className="pricing">
          <div className="price">
            <h3>Free</h3><div className="amt">₦0<span> /forever</span></div>
            <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "4px 0 0" }}>For getting started</p>
            <ul><li><Icon name="check" /> Unlimited invoices &amp; receipts</li><li><Icon name="check" /> Item catalog &amp; customers</li><li><Icon name="check" /> Branded invoices</li><li><Icon name="check" /> Send on WhatsApp &amp; email</li></ul>
            <Link className="btn btn-white" href="/signin">Start free</Link>
          </div>
          <div className="price feat">
            <h3>Pro</h3><div className="amt">₦5,000<span> /month</span></div>
            <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "4px 0 0" }}>For growing businesses</p>
            <ul><li><Icon name="check" /> Everything in Free</li><li><Icon name="check" /> Online payments (Paystack/Flutterwave)</li><li><Icon name="check" /> Reminders &amp; recurring invoices</li><li><Icon name="check" /> Paper mode &amp; handwriting</li><li><Icon name="check" /> Light accounting &amp; reports</li></ul>
            <Link className="btn btn-gold" href="/signin">Go Pro</Link>
          </div>
          <div className="price">
            <h3>Compliance</h3><div className="amt">Custom</div>
            <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "4px 0 0" }}>For VAT-registered firms</p>
            <ul><li><Icon name="check" /> Everything in Pro</li><li><Icon name="check" /> FIRS/NRS e-invoicing (QR + CSID)</li><li><Icon name="check" /> White-label &amp; multi-branch</li><li><Icon name="check" /> Priority support</li></ul>
            <Link className="btn btn-white" href="/signin">Talk to us</Link>
          </div>
        </div>
      </div></section>

      <footer className="lfoot"><div className="wrap row">
        <div className="brand" style={{ fontSize: 16 }}><span className="seal" style={{ width: 28, height: 28, fontSize: 12 }}>Lb</span> Ledgerbook</div>
        <div>© 2026 Ledgerbook · Invoices &amp; receipts for African businesses</div>
      </div></footer>
    </div>
  );
}
