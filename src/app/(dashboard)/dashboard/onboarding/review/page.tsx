import Link from "next/link";

import { DashboardPage } from "@/components/dashboard/dashboard-layout";
import { saveBusinessReviewAction } from "@/app/(dashboard)/dashboard/onboarding/actions";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "business_name, website, google_business_url, services, hours, phone, address, additional_context, first_message, system_prompt"
    )
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <DashboardPage
      title="Your AI receptionist profile"
      description="Step 3 — review and refine. Every field shapes how callers are greeted."
    >
      {error ? (
        <div className="mb-8 max-w-3xl rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card className="max-w-4xl p-8 lg:p-10">
        <form action={saveBusinessReviewAction} className="grid gap-8">
          <section className="grid gap-4">
            <h2 className="font-display text-xl font-semibold">Business identity</h2>
            <div className="grid gap-2">
              <Label htmlFor="business_name">Business name</Label>
              <Input
                id="business_name"
                name="business_name"
                defaultValue={business?.business_name ?? ""}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Website</Label>
                <Input
                  defaultValue={business?.website ?? ""}
                  disabled
                  className="bg-muted/50 text-muted-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label>Google Business</Label>
                <Input
                  defaultValue={business?.google_business_url ?? ""}
                  disabled
                  className="bg-muted/50 text-muted-foreground"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-4 border-t border-border pt-8">
            <h2 className="font-display text-xl font-semibold">What you offer</h2>
            <div className="grid gap-2">
              <Label htmlFor="services">Services (one per line)</Label>
              <Textarea
                id="services"
                name="services"
                rows={5}
                defaultValue={
                  Array.isArray(business?.services)
                    ? business.services.join("\n")
                    : ""
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="hours">Hours</Label>
                <Input id="hours" name="hours" defaultValue={business?.hours ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={business?.phone ?? ""} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={business?.address ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="additional_context">Additional context</Label>
              <Textarea
                id="additional_context"
                name="additional_context"
                rows={4}
                defaultValue={business?.additional_context ?? ""}
              />
            </div>
          </section>

          <section className="grid gap-4 border-t border-border pt-8">
            <h2 className="font-display text-xl font-semibold">Voice & personality</h2>
            <div className="grid gap-2">
              <Label htmlFor="first_message">First message</Label>
              <Textarea
                id="first_message"
                name="first_message"
                rows={3}
                defaultValue={business?.first_message ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="system_prompt">System prompt</Label>
              <Textarea
                id="system_prompt"
                name="system_prompt"
                rows={8}
                className="font-mono text-xs"
                defaultValue={business?.system_prompt ?? ""}
              />
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/dashboard/onboarding"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← Start over
            </Link>
            <Button type="submit" size="lg">
              Launch receptionist
            </Button>
          </div>
        </form>
      </Card>
    </DashboardPage>
  );
}
