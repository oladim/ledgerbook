import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Paystack redirects here after checkout. Verify the transaction, then activate the plan.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!reference || !secret) return NextResponse.redirect(`${origin}/billing?error=1`);

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const j = await res.json();
  if (j.status && j.data?.status === "success") {
    const meta = j.data.metadata || {};
    const cycle = meta.cycle === "year" ? 365 : 30;
    const expires = new Date(Date.now() + cycle * 86400000).toISOString();
    const supabase = await createClient();
    await supabase.from("organizations").update({ plan: meta.plan, plan_status: "active", plan_expires: expires }).eq("id", meta.orgId);
    return NextResponse.redirect(`${origin}/billing?paid=1`);
  }
  return NextResponse.redirect(`${origin}/billing?error=1`);
}
