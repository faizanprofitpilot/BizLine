import { NextResponse } from "next/server";

import { getStripe } from "@/lib/server/stripe";
import { env } from "@/lib/server/env";
import { assertAllowedPriceId } from "@/lib/server/plans";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const stripe = getStripe();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { priceId?: string };
  const priceId = body.priceId;
  if (!priceId) {
    return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
  }

  let plan;
  try {
    plan = assertAllowedPriceId(priceId);
  } catch {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: subRow } = await admin
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

    await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        status: "incomplete",
        plan,
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
    metadata: {
      supabase_user_id: user.id,
      plan,
    },
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
