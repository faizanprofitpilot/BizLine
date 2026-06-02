import { DashboardPage } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const messages = [
  "Reading your website…",
  "Learning your services…",
  "Understanding your tone…",
  "Building your receptionist…",
];

export default function OnboardingLoading() {
  return (
    <DashboardPage
      title="Learning your business"
      description="This usually takes less than a minute."
    >
      <div className="mx-auto max-w-2xl">
        <Card className="p-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
            <div className="size-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
          <p className="mt-8 font-display text-2xl font-semibold animate-pulse-soft">
            Learning your business…
          </p>
          <div className="mt-8 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={msg}
                className="flex items-center gap-3 text-sm text-muted-foreground"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <Skeleton className="size-2 rounded-full" />
                {msg}
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6 mx-auto" />
            <Skeleton className="h-3 w-4/6 mx-auto" />
          </div>
        </Card>
      </div>
    </DashboardPage>
  );
}
