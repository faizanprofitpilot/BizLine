import Link from "next/link";

import { ProvisionButton } from "@/components/dashboard/provision-button";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function OnboardingLivePage() {
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

  const hasNumber = Boolean(assistant?.twilio_phone_number);

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-8 text-center lg:p-10">
        {business?.business_name ? (
          <p className="text-sm font-medium text-muted-foreground">
            {business.business_name}
          </p>
        ) : null}

        <div className="mt-6">
          <ProvisionButton
            alreadyProvisioned={hasNumber}
            phoneNumber={assistant?.twilio_phone_number}
          />
        </div>

        {!hasNumber ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Your AI receptionist is ready. Generate a dedicated number to start
            receiving calls.
          </p>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            You&apos;re all set. Head to the dashboard to view calls and manage
            your line.
          </p>
        )}

        {hasNumber ? (
          <div className="mt-8">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Go to dashboard
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
