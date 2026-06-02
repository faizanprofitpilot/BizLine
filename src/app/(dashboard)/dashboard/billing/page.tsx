import Link from "next/link";
import { redirect } from "next/navigation";

import { env } from "@/lib/server/env";
import { getStripe } from "@/lib/server/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

function PriceButton({ priceId, label }: { priceId: string; label: string }) {
  return (
    <form action={startCheckoutAction}>
      <input type="hidden" name="priceId" value={priceId} />
      <button
        type="submit"
        className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        {label}
      </button>
    </form>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; error?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <p className="text-sm text-muted-foreground">
          Please <Link href="/login">log in</Link> to manage billing.
        </p>
      </main>
    );
  }

  const { success, canceled, error } = await searchParams;

  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("status, plan, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        An active subscription is required before we create your receptionist.
      </p>

      {success ? (
        <div className="mt-6 rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Checkout completed. If your access doesn’t update immediately, refresh in a
          moment.
        </div>
      ) : null}
      {canceled ? (
        <div className="mt-6 rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Checkout canceled.
        </div>
      ) : null}
      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mt-6 rounded-lg border bg-card px-4 py-3 text-sm">
        <div className="font-medium">Status</div>
        <div className="mt-1 text-muted-foreground">
          {subRow?.status ? subRow.status : "No subscription"}
        </div>
      </div>
      {subRow?.stripe_customer_id ? (
        <form action={openPortalAction} className="mt-4">
          <button
            type="submit"
            className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Manage billing
          </button>
        </form>
      ) : null}

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="text-sm font-semibold">Starter</div>
          <p className="mt-2 text-sm text-muted-foreground">100 minutes / month</p>
          <PriceButton priceId={env.stripe.priceStarter()} label="Choose Starter" />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="text-sm font-semibold">Growth</div>
          <p className="mt-2 text-sm text-muted-foreground">500 minutes / month</p>
          <PriceButton priceId={env.stripe.priceGrowth()} label="Choose Growth" />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="text-sm font-semibold">Pro</div>
          <p className="mt-2 text-sm text-muted-foreground">2000 minutes / month</p>
          <PriceButton priceId={env.stripe.pricePro()} label="Choose Pro" />
        </div>
      </div>
    </main>
  );
}

