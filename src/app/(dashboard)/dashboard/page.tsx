import Link from "next/link";
import {
  Clock,
  Phone,
  PhoneIncoming,
  Sparkles,
} from "lucide-react";

import {
  DashboardPage,
} from "@/components/dashboard/dashboard-layout";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProvisionButton } from "@/components/dashboard/provision-button";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPhoneNumber } from "@/lib/format-phone";
import { cn } from "@/lib/utils";

export default async function DashboardHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, business_name")
    .eq("user_id", user!.id)
    .maybeSingle();

  const { data: assistant } = business?.id
    ? await supabase
        .from("assistants")
        .select("twilio_phone_number, active")
        .eq("business_id", business.id)
        .maybeSingle()
    : { data: null };

  const { data: calls } = business?.id
    ? await supabase
        .from("calls")
        .select("id, duration, outcome, created_at")
        .eq("business_id", business.id)
    : { data: [] };

  const callList = calls ?? [];
  const callsAnswered = callList.length;
  const leadsCaptured = callList.filter((c) =>
    (c.outcome ?? "").toLowerCase().includes("lead")
  ).length;
  const minutesUsed = Math.round(
    callList.reduce((sum, c) => sum + (c.duration ?? 0), 0) / 60
  );
  const activeNumber = assistant?.twilio_phone_number ?? null;

  const recent = [...callList]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <DashboardPage
      title="Overview"
      description="Your receptionist at a glance—calls, leads, and line status."
      action={
        !assistant?.twilio_phone_number ? (
          <Link
            href="/dashboard/onboarding/live"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Finish setup
          </Link>
        ) : null
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Calls answered"
          value={String(callsAnswered)}
          hint="All time"
          icon={PhoneIncoming}
          accent
        />
        <KpiCard
          label="Leads captured"
          value={String(leadsCaptured)}
          hint="Outcome includes lead"
          icon={Sparkles}
        />
        <KpiCard
          label="Minutes used"
          value={String(minutesUsed)}
          hint="From call duration"
          icon={Clock}
        />
        <KpiCard
          label="Active number"
          value={assistant?.active ? "Live" : "Pending"}
          hint={activeNumber ? formatPhoneNumber(activeNumber) : "Status"}
          icon={Phone}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3 p-0 overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-display text-xl font-semibold">Recent calls</h2>
          </div>
          {recent.length ? (
            <ul className="divide-y divide-border">
              {recent.map((call) => (
                <li key={call.id}>
                  <Link
                    href={`/dashboard/calls/${call.id}`}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {call.outcome || "Call"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(call.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-sm text-primary">View →</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No calls yet. Provision your number and place a test call.
            </div>
          )}
          <div className="border-t border-border px-6 py-3">
            <Link
              href="/dashboard/calls"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all calls
            </Link>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-xl font-semibold">Phone line</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate a dedicated number connected to your AI receptionist.
            </p>
            <div className="mt-6">
              <ProvisionButton
                alreadyProvisioned={Boolean(assistant?.twilio_phone_number)}
                phoneNumber={assistant?.twilio_phone_number}
              />
            </div>
          </Card>

          <Card hover className="p-6">
            <h2 className="font-display text-lg font-semibold">Quick actions</h2>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/dashboard/settings"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-start")}
              >
                Receptionist settings
              </Link>
              <Link
                href="/dashboard/calls"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-start")}
              >
                View all calls
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardPage>
  );
}
