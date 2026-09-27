"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient, adminEmails } from "@/lib/supabase/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !adminEmails().includes(user.email.toLowerCase())) throw new Error("Forbidden");
}

export async function setOrgPlanAction(input: { orgId: string; plan: string; status: string; months: number }) {
  await assertAdmin();
  const db = adminClient();
  const expires = input.plan === "free" ? null : new Date(Date.now() + input.months * 30 * 86400000).toISOString();
  await db.from("organizations").update({ plan: input.plan, plan_status: input.status, plan_expires: expires }).eq("id", input.orgId);
  revalidatePath("/admin");
}
