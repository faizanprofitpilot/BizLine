import { NextResponse } from "next/server";

import { getStripe } from "@/lib/server/stripe";
import { env } from "@/lib/server/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const stripe = getStripe();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subRow?.stripe_customer_id) {
    return NextResponse.json({ error: "No customer" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subRow.stripe_customer_id,
    return_url: `${env.appUrl()}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}

