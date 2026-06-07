import Link from "next/link";
import { MapPin } from "lucide-react";

import {
  rescrapeSettingsAction,
  saveSettingsAction,
} from "@/app/(dashboard)/dashboard/settings/actions";
import { DashboardPage } from "@/components/dashboard/dashboard-layout";
import {
  RescrapeSubmitButton,
  SaveSettingsSubmitButton,
} from "@/components/dashboard/settings-form-actions";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; rescraped?: string; error?: string }>;
}) {
  const { saved, rescraped, error } = await searchParams;
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
      title="Settings"
      description="How your receptionist represents you on every call."
    >
      {saved ? (
        <Card className="mb-8 border-emerald-200 bg-emerald-50/80 p-5 text-sm text-emerald-900">
          Changes saved. Your live receptionist has been updated.
        </Card>
      ) : null}
      {rescraped ? (
        <Card className="mb-8 border-primary/20 bg-accent/40 p-5 text-sm text-accent-foreground">
          Profile refreshed from your website. Review the fields above, then click
          Save changes to update your live receptionist.
        </Card>
      ) : null}
      {error ? (
        <Card className="mb-8 border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {error}
        </Card>
      ) : null}

      {business ? (
        <form action={saveSettingsAction} className="grid gap-6 lg:grid-cols-2">
          <Card className="p-8">
            <h2 className="font-display text-xl font-semibold">Business</h2>
            <div className="mt-6 grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="business_name">Business name</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  defaultValue={business.business_name ?? ""}
                />
              </div>

              {(business.website || business.google_business_url) ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Website</Label>
                    <Input
                      defaultValue={business.website ?? ""}
                      disabled
                      className="bg-muted/50 text-muted-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Google Business</Label>
                    <Input
                      defaultValue={business.google_business_url ?? ""}
                      disabled
                      className="bg-muted/50 text-muted-foreground"
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="services">Services (one per line)</Label>
                <Textarea
                  id="services"
                  name="services"
                  rows={5}
                  defaultValue={
                    Array.isArray(business.services)
                      ? business.services.join("\n")
                      : ""
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input id="hours" name="hours" defaultValue={business.hours ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    defaultValue={business.phone ?? ""}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={business.address ?? ""} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="additional_context">Additional context</Label>
                <Textarea
                  id="additional_context"
                  name="additional_context"
                  rows={4}
                  defaultValue={business.additional_context ?? ""}
                />
              </div>
            </div>
          </Card>

          <Card className="flex flex-col p-8">
            <h2 className="font-display text-xl font-semibold">AI instructions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The greeting callers hear and the system prompt that guides every
              conversation.
            </p>
            <div className="mt-6 grid flex-1 gap-5">
              <div className="grid gap-2">
                <Label htmlFor="first_message">First message</Label>
                <Textarea
                  id="first_message"
                  name="first_message"
                  rows={3}
                  defaultValue={business.first_message ?? ""}
                  placeholder="Hello! You've reached your business. How can we help you today?"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="system_prompt">System prompt</Label>
                <Textarea
                  id="system_prompt"
                  name="system_prompt"
                  rows={18}
                  className="font-mono text-xs leading-relaxed"
                  defaultValue={business.system_prompt ?? ""}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end lg:col-span-2">
            <SaveSettingsSubmitButton />
          </div>
        </form>
      ) : (
        <Card className="mb-8 p-8">
          <p className="text-sm text-muted-foreground">
            Complete{" "}
            <Link href="/dashboard/onboarding" className="font-medium text-primary hover:underline">
              onboarding
            </Link>{" "}
            first to set up your business profile.
          </p>
        </Card>
      )}

      <Card className="mt-8 p-8">
        <h2 className="font-display text-xl font-semibold">Refresh from website</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Re-scrape your website to update business details and AI instructions. Changes
          apply to your live receptionist after you save.
        </p>

        {business ? (
          <form action={rescrapeSettingsAction} className="mt-6 grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                placeholder="https://yourbusiness.com"
                defaultValue={business.website ?? ""}
              />
            </div>

            <div className="relative py-1">
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
                  defaultValue={business.google_business_url ?? ""}
                />
              </div>
            </div>

            <RescrapeSubmitButton />
          </form>
        ) : null}
      </Card>
    </DashboardPage>
  );
}
