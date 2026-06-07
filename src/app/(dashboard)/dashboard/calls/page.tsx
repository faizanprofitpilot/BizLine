import { PhoneIncoming } from "lucide-react";

import { DashboardPage } from "@/components/dashboard/dashboard-layout";
import { OutcomeBadge } from "@/components/dashboard/call-badges";
import { CallTableRow } from "@/components/dashboard/call-table-row";
import { Card } from "@/components/ui/card";
import { formatPhoneNumber } from "@/lib/format-phone";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CallsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();

  const { data: calls } = business?.id
    ? await supabase
        .from("calls")
        .select("id, created_at, caller_number, duration, outcome, summary")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const rows = calls ?? [];

  return (
    <DashboardPage
      title="Calls"
      description="Every conversation—summarized, classified, and ready to review."
    >
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Caller</th>
                <th className="px-6 py-4">Outcome</th>
                <th className="px-6 py-4">Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((c) => (
                  <CallTableRow key={c.id} id={c.id}>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {new Date(c.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {c.caller_number
                        ? formatPhoneNumber(c.caller_number)
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      <OutcomeBadge outcome={c.outcome} />
                    </td>
                    <td className="max-w-md truncate px-6 py-4 text-sm text-muted-foreground">
                      {c.summary ?? "—"}
                    </td>
                  </CallTableRow>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <PhoneIncoming className="mx-auto size-10 text-muted-foreground/40" />
                    <p className="mt-4 font-medium text-foreground">No calls yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Provision your number from the overview, then place a test call.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardPage>
  );
}
