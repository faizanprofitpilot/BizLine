"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  extractBusinessFromScrape,
  generateReceptionistPrompts,
  scrapeBusinessSource,
} from "@/lib/server/onboarding";
import { formatPhoneNumber } from "@/lib/format-phone";
import { parseBusinessFormData } from "@/lib/server/business-profile";
import { ensureVapiAssistantForUser } from "@/lib/server/vapi-assistant";

export async function startOnboardingAction(formData: FormData) {
  const websiteUrlRaw = String(formData.get("websiteUrl") ?? "").trim();
  const googleUrlRaw = String(formData.get("googleBusinessUrl") ?? "").trim();

  const websiteUrl = websiteUrlRaw || undefined;
  const googleBusinessUrl = googleUrlRaw || undefined;

  if (!websiteUrl && !googleBusinessUrl) {
    redirect("/dashboard/onboarding?error=Please%20enter%20a%20URL");
  }
  if (websiteUrl && googleBusinessUrl) {
    redirect("/dashboard/onboarding?error=Please%20enter%20only%20one%20URL");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const scrape = await scrapeBusinessSource({ websiteUrl, googleBusinessUrl });
  const extracted = await extractBusinessFromScrape(scrape);
  const prompts = await generateReceptionistPrompts({
    sourceUrl: scrape.sourceUrl,
    pages: scrape.pages,
    extracted,
  });

  const payload = {
    user_id: user.id,
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
  };

  const upsertRes = await supabase
    .from("businesses")
    .upsert(payload, {
      onConflict: "user_id",
    })
    .select("id")
    .single();

  if (upsertRes.error) {
    redirect(`/dashboard/onboarding?error=${encodeURIComponent(upsertRes.error.message)}`);
  }

  redirect(`/dashboard/onboarding/review`);
}

export async function saveBusinessReviewAction(formData: FormData) {
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

  if (error) redirect(`/dashboard/onboarding/review?error=${encodeURIComponent(error.message)}`);

  try {
    await ensureVapiAssistantForUser(user.id);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create Vapi assistant";
    redirect(
      `/dashboard/onboarding/review?error=${encodeURIComponent(message)}`
    );
  }

  redirect("/dashboard/onboarding/live");
}

