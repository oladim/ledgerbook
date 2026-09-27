import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getWorkspace } from "@/server/data";

// Server component: gate on auth, load the workspace from Supabase, hand it to the client shell.
export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getWorkspace();
  if (!workspace) redirect("/signin");
  return <AppShell initial={workspace}>{children}</AppShell>;
}
