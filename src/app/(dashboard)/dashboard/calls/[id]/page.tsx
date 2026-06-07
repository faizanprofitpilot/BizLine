import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardPage } from "@/components/dashboard/dashboard-layout";
import {
  OutcomeBadge,
  SentimentBadge,
  UrgencyBadge,
} from "@/components/dashboard/call-badges";
import { AudioPlayer } from "@/components/dashboard/audio-player";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatPhoneNumber } from "@/lib/format-phone";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: call } = await supabase
    .from("calls")
    .select(
      "id, created_at, caller_number, duration, transcript, summary, outcome, urgency, sentiment, recording_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (!call) notFound();

  const durationMin = call.duration
    ? `${Math.max(1, Math.round(call.duration / 60))} min`
    : "—";

  return (
    <DashboardPage
      title="Call detail"
      description={new Date(call.created_at).toLocaleString()}
      action={
        <Link
          href="/dashboard/calls"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ArrowLeft className="size-4" />
          All calls
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Caller
          </p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {call.caller_number
              ? formatPhoneNumber(call.caller_number)
              : "Unknown"}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Duration: {durationMin}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <OutcomeBadge outcome={call.outcome} />
            <UrgencyBadge urgency={call.urgency} />
            <SentimentBadge sentiment={call.sentiment} />
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Summary
          </p>
          <p className="mt-3 text-base leading-relaxed text-foreground">
            {call.summary || "No summary available."}
          </p>
        </Card>
      </div>

      {call.recording_url ? (
        <div className="mt-6">
          <AudioPlayer src={call.recording_url} />
        </div>
      ) : null}

      <Card className="mt-6 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Transcript
        </p>
        <pre className="mt-4 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-xl bg-background/80 p-5 font-mono text-sm leading-relaxed text-foreground">
          {call.transcript?.trim() || "No transcript captured."}
        </pre>
      </Card>
    </DashboardPage>
  );
}
