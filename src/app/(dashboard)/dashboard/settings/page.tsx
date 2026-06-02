import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "business_name, services, hours, phone, address, additional_context, first_message, system_prompt"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to overview
        </Link>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Editing these values will update how your receptionist behaves for future calls.
      </p>

      <div className="mt-8 rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Settings editing + live Vapi updates will be wired next.
        <div className="mt-2 text-xs">
          TODO: Implement save action that updates `businesses` and patches Vapi assistant per docs.
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Business name</div>
          <div className="mt-1">{business?.business_name ?? "-"}</div>
        </div>
      </div>
    </main>
  );
}

