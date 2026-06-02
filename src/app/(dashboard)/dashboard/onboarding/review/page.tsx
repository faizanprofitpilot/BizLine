import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveBusinessReviewAction } from "@/app/(dashboard)/dashboard/onboarding/actions";

export default async function OnboardingReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <p className="text-sm text-muted-foreground">
          Please <Link href="/login">log in</Link>.
        </p>
      </main>
    );
  }

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "business_name, website, google_business_url, services, hours, phone, address, additional_context, first_message, system_prompt"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Review details</h1>
        <Link
          href="/dashboard/onboarding"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Confirm everything below. Changes here will immediately shape your AI receptionist.
      </p>

      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <form action={saveBusinessReviewAction} className="mt-8 grid gap-6">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Business name</span>
          <input
            name="business_name"
            defaultValue={business?.business_name ?? ""}
            className="h-10 rounded-lg border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Website</span>
            <input
              defaultValue={business?.website ?? ""}
              disabled
              className="h-10 rounded-lg border bg-muted px-3 text-muted-foreground"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Google Business URL</span>
            <input
              defaultValue={business?.google_business_url ?? ""}
              disabled
              className="h-10 rounded-lg border bg-muted px-3 text-muted-foreground"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Services (one per line)</span>
          <textarea
            name="services"
            defaultValue={Array.isArray(business?.services) ? business?.services.join("\n") : ""}
            rows={6}
            className="rounded-lg border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Hours</span>
            <input
              name="hours"
              defaultValue={business?.hours ?? ""}
              className="h-10 rounded-lg border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Phone</span>
            <input
              name="phone"
              defaultValue={business?.phone ?? ""}
              className="h-10 rounded-lg border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Address</span>
          <input
            name="address"
            defaultValue={business?.address ?? ""}
            className="h-10 rounded-lg border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Additional context</span>
          <textarea
            name="additional_context"
            defaultValue={business?.additional_context ?? ""}
            rows={5}
            className="rounded-lg border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">First message</span>
          <textarea
            name="first_message"
            defaultValue={business?.first_message ?? ""}
            rows={3}
            className="rounded-lg border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">System prompt</span>
          <textarea
            name="system_prompt"
            defaultValue={business?.system_prompt ?? ""}
            rows={10}
            className="rounded-lg border bg-background px-3 py-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Save & continue
        </button>
      </form>
    </main>
  );
}

