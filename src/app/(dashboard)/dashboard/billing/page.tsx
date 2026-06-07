import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";

import { DashboardPage } from "@/components/dashboard/dashboard-layout";
import { env } from "@/lib/server/env";
import { getStripe } from "@/lib/server/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function startCheckoutAction(formData: FormData) {
  "use server";

  const stripe = getStripe();
  const priceId = String(formData.get("priceId") ?? "");
  if (!priceId) redirect("/dashboard/billing?error=Missing%20price");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) redirect("/login");

  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = subRow?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        status: "incomplete",
      },
      { onConflict: "user_id" }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.appUrl()}/dashboard/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.appUrl()}/dashboard/billing?canceled=1`,
  });

  if (!session.url) redirect("/dashboard/billing?error=Missing%20checkout%20url");
  redirect(session.url);
}

async function openPortalAction() {
  "use server";

  const stripe = getStripe();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) redirect("/login");

  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subRow?.stripe_customer_id) redirect("/dashboard/billing");

  const session = await stripe.billingPortal.sessions.create({
    customer: subRow.stripe_customer_id,
    return_url: `${env.appUrl()}/dashboard/billing`,
  });

  redirect(session.url);
}

const plans = [
  {
    name: "Starter",
    price: "$49",
    minutes: "100 minutes / month",
    priceId: () => env.stripe.priceStarter(),
    features: ["AI receptionist", "Call summaries", "Email notifications"],
    highlight: false,
  },
  {
    name: "Growth",
    price: "$149",
    minutes: "500 minutes / month",
    priceId: () => env.stripe.priceGrowth(),
    features: [
      "Everything in Starter",
      "Priority support",
      "Advanced call insights",
    ],
    highlight: true,
  },
  {
    name: "Pro",
    price: "$399",
    minutes: "2,000 minutes / month",
    priceId: () => env.stripe.pricePro(),
    features: ["Everything in Growth", "High volume lines", "Dedicated onboarding"],
    highlight: false,
  },
];

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; error?: string }>;
}) {
  const { success, canceled, error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("status, plan, stripe_customer_id")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <DashboardPage
      title="Billing"
      description="An active subscription unlocks onboarding and your phone line."
    >
      {success ? (
        <Card className="mb-8 flex flex-col gap-4 border-emerald-200 bg-emerald-50/80 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-emerald-900">
            Checkout complete. Refresh if access doesn&apos;t update immediately.
          </p>
          <Link
            href="/dashboard/onboarding"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0 bg-emerald-700 hover:bg-emerald-800")}
          >
            Set up your receptionist
          </Link>
        </Card>
      ) : null}
      {canceled ? (
        <Card className="mb-8 p-5 text-sm text-muted-foreground">
          Checkout canceled. Choose a plan when you&apos;re ready.
        </Card>
      ) : null}
      {error ? (
        <Card className="mb-8 border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {error}
        </Card>
      ) : null}

      <Card className="mb-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Subscription
          </p>
          <p className="mt-1 font-display text-2xl font-semibold capitalize">
            {subRow?.status ?? "No subscription"}
          </p>
          {subRow?.plan ? (
            <p className="text-sm text-muted-foreground">Plan: {subRow.plan}</p>
          ) : null}
        </div>
        {subRow?.stripe_customer_id ? (
          <form action={openPortalAction}>
            <Button type="submit" variant="outline">
              Manage billing
            </Button>
          </form>
        ) : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            hover
            className={cn(
              "relative flex flex-col p-8",
              plan.highlight && "shadow-glow ring-2 ring-primary/25"
            )}
          >
            {plan.highlight ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-4 py-1 text-xs font-semibold text-white">
                Recommended
              </span>
            ) : null}
            <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight">
              {plan.price}
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{plan.minutes}</p>
            <ul className="mt-6 flex-1 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <form action={startCheckoutAction} className="mt-8">
              <input type="hidden" name="priceId" value={plan.priceId()} />
              <Button
                type="submit"
                variant={plan.highlight ? "default" : "outline"}
                className="w-full"
                size="lg"
              >
                Choose {plan.name}
              </Button>
            </form>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Questions?{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          Learn more
        </Link>
      </p>
    </DashboardPage>
  );
}
