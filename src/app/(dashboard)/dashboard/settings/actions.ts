"use server";

import { redirect } from "next/navigation";

import { formatPhoneNumber } from "@/lib/format-phone";
import { parseBusinessFormData } from "@/lib/server/business-profile";
import {
  extractBusinessFromScrape,
  generateReceptionistPrompts,
  scrapeBusinessSource,
} from "@/lib/server/onboarding";
import { ensureVapiAssistantForUser } from "@/lib/server/vapi-assistant";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parseScrapeUrls(formData: FormData, stored?: {
  website: string | null;
  google_business_url: string | null;
}) {
  const websiteUrlRaw = String(formData.get("websiteUrl") ?? "").trim();
  const googleUrlRaw = String(formData.get("googleBusinessUrl") ?? "").trim();

  let websiteUrl = websiteUrlRaw || stored?.website || undefined;
  let googleBusinessUrl = googleUrlRaw || stored?.google_business_url || undefined;

  if (websiteUrlRaw) {
    websiteUrl = websiteUrlRaw;
    googleBusinessUrl = undefined;
  } else if (googleUrlRaw) {
    googleBusinessUrl = googleUrlRaw;
    websiteUrl = undefined;
  }

  return { websiteUrl, googleBusinessUrl };
}

export async function rescrapeSettingsAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, website, google_business_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!business?.id) {
    redirect(
      "/dashboard/settings?error=Complete%20onboarding%20first%20to%20set%20up%20your%20business%20profile"
    );
  }

  const { websiteUrl, googleBusinessUrl } = parseScrapeUrls(formData, business);

  if (!websiteUrl && !googleBusinessUrl) {
    redirect("/dashboard/settings?error=Please%20enter%20a%20URL");
  }
  if (websiteUrl && googleBusinessUrl) {
    redirect("/dashboard/settings?error=Please%20enter%20only%20one%20URL");
  }

  try {
    const scrape = await scrapeBusinessSource({ websiteUrl, googleBusinessUrl });
    const extracted = await extractBusinessFromScrape(scrape);
    const prompts = await generateReceptionistPrompts({
      sourceUrl: scrape.sourceUrl,
      pages: scrape.pages,
      extracted,
    });

    const { error } = await supabase
      .from("businesses")
      .update({
        business_name: extracted.business_name,
        website: websiteUrl ?? null,
        google_business_url: googleBusinessUrl ?? null,
        services: extracted.services,
        hours: extracted.hours,
        phone: formatPhoneNumber(extracted.phone),
        address: extracted.address,
        additional_context: extracted.additional_context,
        first_message: prompts.first_message,
        system_prompt: prompts.system_prompt,
      })
      .eq("user_id", user.id);

    if (error) {
      redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to scrape website";
    redirect(`/dashboard/settings?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard/settings?rescraped=1");
}

export async function saveSettingsAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = parseBusinessFormData(formData);

  const { error } = await supabase
    .from("businesses")
    .update(profile)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
  }

  try {
    await ensureVapiAssistantForUser(user.id);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to sync Vapi assistant";
    redirect(`/dashboard/settings?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard/settings?saved=1");
}
