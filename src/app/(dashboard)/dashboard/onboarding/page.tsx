import Link from "next/link";
import { Globe, MapPin } from "lucide-react";

import { DashboardPage } from "@/components/dashboard/dashboard-layout";
import { startOnboardingAction } from "@/app/(dashboard)/dashboard/onboarding/actions";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function OnboardingStartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <DashboardPage
      title="Set up your receptionist"
      description="Paste your website or Google Business Profile—we'll learn your business in seconds."
    >
      <div className="mx-auto max-w-3xl">
        {error ? (
          <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-5">
          <Card className="flex flex-col items-center justify-center p-10 text-center lg:col-span-2">
            <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-brand text-white shadow-elevated">
              <Globe className="size-9" strokeWidth={1.75} />
            </div>
            <p className="mt-6 font-display text-xl font-semibold">Step 1</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We scrape your public business info and draft a receptionist profile.
            </p>
          </Card>

          <Card className="p-8 lg:col-span-3">
            <form action={startOnboardingAction} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  placeholder="https://yourbusiness.com"
                />
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-card px-3 text-muted-foreground">or</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="googleBusinessUrl">Google Business Profile URL</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="googleBusinessUrl"
                    name="googleBusinessUrl"
                    type="url"
                    className="pl-11"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-2 w-full">
                Continue — learn my business
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/dashboard" className="font-medium text-primary hover:underline">
                Back to overview
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </DashboardPage>
  );
}
