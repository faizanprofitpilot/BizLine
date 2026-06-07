import { Mic, PhoneIncoming } from "lucide-react";

import { DashboardPage } from "@/components/dashboard/dashboard-layout";
import { OutcomeBadge } from "@/components/dashboard/call-badges";
import { CallTableRow } from "@/components/dashboard/call-table-row";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { Card } from "@/components/ui/card";
import { parseDateRange } from "@/lib/date-range";
import { formatPhoneNumber } from "@/lib/format-phone";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { range, from, to } = await searchParams;
  const dateRange = parseDateRange({ range, from, to });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();

  let callsQuery = business?.id
    ? supabase
        .from("calls")
        .select("id, created_at, caller_number, duration, outcome, summary, recording_url")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : null;

  if (callsQuery && dateRange.start) {
    callsQuery = callsQuery.gte("created_at", dateRange.start.toISOString());
  }
  if (callsQuery && dateRange.end) {
    callsQuery = callsQuery.lte("created_at", dateRange.end.toISOString());
  }

  const { data: calls } = callsQuery ? await callsQuery : { data: [] };

  const rows = calls ?? [];

  return (
    <DashboardPage
      title="Calls"
      description="Every conversation—summarized, classified, and ready to review."
    >
      <div className="mb-6">
        <DateRangeFilter
          basePath="/dashboard/calls"
          activeRange={dateRange.key}
          from={from}
          to={to}
        />
      </div>

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
                    <td className="max-w-md px-6 py-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        {c.recording_url ? (
                          <Mic
                            className="size-3.5 shrink-0 text-primary"
                            aria-label="Recording available"
                          />
                        ) : null}
                        <span className="truncate">{c.summary ?? "—"}</span>
                      </span>
                    </td>
                  </CallTableRow>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <PhoneIncoming className="mx-auto size-10 text-muted-foreground/40" />
                    <p className="mt-4 font-medium text-foreground">
                      {dateRange.key !== "all" ? "No calls in this range" : "No calls yet"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {dateRange.key !== "all"
                        ? "Try a wider date range or clear the filter."
                        : "Provision your number from the overview, then place a test call."}
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
