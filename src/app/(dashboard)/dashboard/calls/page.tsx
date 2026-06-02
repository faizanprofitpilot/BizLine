import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CallsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <p className="text-sm text-muted-foreground">
          Please <Link href="/login">log in</Link>.
        </p>
      </main>
    );
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: calls } = business?.id
    ? await supabase
        .from("calls")
        .select("id, created_at, caller_number, duration, outcome, summary")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Call logs</h1>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to overview
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Caller</th>
              <th className="px-4 py-3 text-left font-medium">Outcome</th>
              <th className="px-4 py-3 text-left font-medium">Summary</th>
            </tr>
          </thead>
          <tbody>
            {(calls ?? []).length ? (
              (calls ?? []).map((c) => (
                <tr key={c.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/calls/${c.id}`} className="hover:underline">
                      {new Date(c.created_at).toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.caller_number ?? "Unknown"}</td>
                  <td className="px-4 py-3">{c.outcome ?? "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.summary ?? "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                  No calls yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

