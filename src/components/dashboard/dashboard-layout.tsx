import { redirect } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-dvh items-stretch bg-background">
      <DashboardSidebar businessName={business?.business_name} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export function DashboardPage({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-border/80 bg-card/40 px-8 py-8 backdrop-blur-sm lg:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </header>
      <main className="flex-1 px-8 py-8 lg:px-12 lg:py-10">{children}</main>
    </>
  );
}
