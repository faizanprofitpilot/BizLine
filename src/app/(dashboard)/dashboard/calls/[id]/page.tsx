import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // RLS ensures the user can only see their own call.
  const { data: call } = await supabase
    .from("calls")
    .select(
      "id, created_at, caller_number, duration, transcript, summary, outcome, urgency, sentiment, recording_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (!call) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Call detail</h1>
        <Link
          href="/dashboard/calls"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to call logs
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Date</div>
          <div className="mt-1 text-sm">{new Date(call.created_at).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Caller</div>
          <div className="mt-1 text-sm">{call.caller_number ?? "Unknown"}</div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Outcome</div>
          <div className="mt-1 text-sm">{call.outcome ?? "-"}</div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Sentiment</div>
          <div className="mt-1 text-sm">{call.sentiment ?? "-"}</div>
        </div>
      </div>

      {call.recording_url ? (
        <div className="mt-6 rounded-xl border bg-card p-5">
          <div className="text-sm font-medium">Recording</div>
          <a
            href={call.recording_url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block text-sm text-primary hover:underline"
          >
            Open recording
          </a>
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="text-sm font-medium">Summary</div>
        <p className="mt-2 text-sm text-muted-foreground">{call.summary ?? "-"}</p>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="text-sm font-medium">Transcript</div>
        <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-muted p-4 text-xs leading-5">
          {call.transcript ?? ""}
        </pre>
      </div>
    </main>
  );
}

