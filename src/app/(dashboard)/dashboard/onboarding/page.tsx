import Link from "next/link";

import { startOnboardingAction } from "@/app/(dashboard)/dashboard/onboarding/actions";

export default async function OnboardingStartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Onboarding</h1>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          Back to dashboard
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Paste your website URL <span className="font-medium">or</span> your Google Business Profile URL.
      </p>

      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <form action={startOnboardingAction} className="mt-8 grid gap-5">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Website URL</span>
          <input
            name="websiteUrl"
            type="url"
            placeholder="https://example.com"
            className="h-10 rounded-lg border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="text-center text-xs text-muted-foreground">OR</div>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Google Business Profile URL</span>
          <input
            name="googleBusinessUrl"
            type="url"
            placeholder="https://www.google.com/maps?cid=..."
            className="h-10 rounded-lg border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Continue
        </button>
      </form>
    </main>
  );
}

