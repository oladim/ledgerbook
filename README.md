# Ledgerbook — Invoices & Receipts (Next.js + Supabase)

Multi-tenant invoicing app. Google sign-in, data saved to and retrieved from Supabase
(Postgres + Row-Level Security), branded invoices & receipts, and printing to A4
(multi-page) or a thermal/label roll.

## 1. Create a Supabase project
https://supabase.com → new project.

## 2. Run the schema
Supabase dashboard → **SQL editor** → paste all of `supabase/schema.sql` → Run.
This creates the tables, Row-Level Security, and a trigger that gives every new
Google user their own workspace (with two starter items) automatically.

## 3. Enable Google sign-in
- Supabase → **Authentication → Providers → Google** → enable, and paste your
  Google OAuth **Client ID / Secret** (from Google Cloud Console → OAuth consent + credentials).
- In Google Cloud, add the authorized redirect URI Supabase shows you
  (looks like `https://<ref>.supabase.co/auth/v1/callback`).
- Supabase → **Authentication → URL Configuration** → add your site URL
  (`http://localhost:3000` for local) to the redirect allow-list.

## 4. Environment
```bash
cp .env.example .env.local
```
Fill in from Supabase → **Project Settings → API** (URL + anon key) and
**Connect → Session pooler** for `DATABASE_URL`.

## 5. Run
```bash
npm install
npm run dev
```
Open http://localhost:3000 → **Sign in** → Continue with Google.

## What's wired
- **Auth:** Google OAuth (`/signin`), session refresh + route guard (`src/middleware.ts`),
  callback (`/auth/callback`), sign-out (`/auth/signout`).
- **Database:** reads via `src/server/data.ts`, writes via `src/server/actions.ts`
  (items, customers, invoices, payments/receipts, org settings). RLS scopes every row to
  the signed-in user's workspace.
- **Print:** `src/lib/print.ts` — A4 (multi-page, repeating table header) and thermal/label
  (76mm). Buttons on the invoice builder preview and the receipt modal.

## Notes / next steps
- Logo, signature and stamp are stored as data URLs on the org row for now; moving them to
  Supabase Storage is a good later upgrade.
- Background removal + logo colour extraction run client-side (`src/lib/image.ts`).
- Invoice numbering increments a per-org counter; fine for now, can be hardened for high concurrency.

## New: billing, admin, VAT, WhatsApp

### Run the migrations (Supabase SQL editor)
- `supabase/migration-plans.sql` — plan / status / expiry columns (needed for the free limit + Paystack).
- `supabase/migration-receipts.sql` — customer/description on receipts (for standalone receipts).

### Paystack billing
1. Add to `.env.local`: `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL` (your public URL, e.g. `http://localhost:3000`).
2. Plans: Free = 5 invoices. Basic ₦2,000/mo (10% off yearly). Pro ₦5,000/mo (15% off yearly).
3. Flow: **Billing** page → "Pay with Paystack" → Paystack checkout → returns to `/billing/verify`, which verifies the transaction and activates the plan with an expiry. The free 5-invoice cap is enforced in `createInvoiceAction`.
4. For production reliability, also add a Paystack webhook later; callback verification covers the common case.

### Admin console
- Set `ADMIN_EMAILS` in `.env.local` (comma-separated) to the Google emails allowed in.
- Visit **/admin** (separate URL) to see every organisation and set plan / status / expiry. It uses the `SUPABASE_SERVICE_ROLE_KEY` (server-only) to read across tenants.

### Other
- **VAT owed (7.5%)** shows on the dashboard — the collected VAT payable to FIRS.
- **Share on WhatsApp** buttons on invoices and receipts open WhatsApp with a prefilled summary.
- Print anchors the footer/signature to the bottom of a single page for short invoices, and paginates for long ones.

## This round
Run `supabase/migration-void.sql` (adds void_reason / voided_at). Public share links use the
service role, so `SUPABASE_SERVICE_ROLE_KEY` must be set for /view/* pages to load.

- **Invoice preview dialog** — click any invoice row to preview it in a dialog with actions.
- **Filters** — All / Outstanding / Paid tabs on the invoices list.
- **Void with reason** — void an invoice from its dialog; the reason shows on the document.
- **Receipts** — click a receipt to view and re-share it (PDF / image) on WhatsApp.
- **WhatsApp: PDF, image, or link** — the link (/view/invoice/[id], /view/receipt/[id]) opens the
  document in the recipient's browser (tap to open, no download). PDF/image use the share sheet on mobile.
- **Due dates + reminders** — set a due date when creating an invoice; the **Reminders** page lists
  everything outstanding with days-until/overdue and one-tap WhatsApp / email reminders.
- **Automatic reminders (Pro)** — needs a scheduler + email/WhatsApp provider (not wired here).
