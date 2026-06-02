import { DashboardPage } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "business_name, services, hours, phone, address, additional_context, first_message, system_prompt"
    )
    .eq("user_id", user!.id)
    .maybeSingle();

  const fields = [
    { label: "Business name", value: business?.business_name },
    { label: "Hours", value: business?.hours },
    { label: "Phone", value: business?.phone },
    { label: "Address", value: business?.address },
    {
      label: "Services",
      value: Array.isArray(business?.services)
        ? business.services.join(", ")
        : undefined,
    },
    { label: "First message", value: business?.first_message },
  ];

  return (
    <DashboardPage
      title="Settings"
      description="How your receptionist represents you on every call."
    >
      <Card className="mb-8 border-primary/20 bg-accent/30 p-6">
        <p className="text-sm leading-relaxed text-accent-foreground">
          Live editing and Vapi sync are coming next. For now, update your profile
          during onboarding review or contact support for changes.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-8">
          <h2 className="font-display text-xl font-semibold">Business</h2>
          <dl className="mt-6 space-y-5">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {f.label}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-foreground">
                  {f.value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-8">
          <h2 className="font-display text-xl font-semibold">AI instructions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            System prompt used for call behavior.
          </p>
          <pre className="mt-6 max-h-80 overflow-auto rounded-xl bg-background/80 p-4 font-mono text-xs leading-relaxed text-foreground">
            {business?.system_prompt?.trim() || "No system prompt set."}
          </pre>
          {business?.additional_context ? (
            <>
              <h3 className="mt-8 text-sm font-semibold text-foreground">
                Additional context
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {business.additional_context}
              </p>
            </>
          ) : null}
        </Card>
      </div>
    </DashboardPage>
  );
}
