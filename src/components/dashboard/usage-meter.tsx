import Link from "next/link";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UsageMeterProps = {
  usage: {
    plan: string | null;
    includedSeconds: number;
    usedSeconds: number;
    remainingSeconds: number;
    currentPeriodEnd: string | null;
    isDemo: boolean;
  };
};

function formatMinutes(seconds: number) {
  return Math.max(0, Math.round(seconds / 60));
}

export function UsageMeter({ usage }: UsageMeterProps) {
  const included = formatMinutes(usage.includedSeconds);
  const used = formatMinutes(usage.usedSeconds);
  const remaining = formatMinutes(usage.remainingSeconds);
  const pct =
    usage.includedSeconds > 0
      ? Math.min(100, Math.round((usage.usedSeconds / usage.includedSeconds) * 100))
      : 0;
  const exhausted = !usage.isDemo && usage.remainingSeconds <= 0;
  const planName = usage.plan
    ? usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)
    : "No plan";
  const resetLabel = usage.currentPeriodEnd
    ? new Date(usage.currentPeriodEnd).toLocaleDateString()
    : "—";

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Call minutes
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            {usage.isDemo ? "Demo line" : planName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {usage.isDemo
              ? "Public demo usage is isolated and does not unlock paid entitlements."
              : `Resets on ${resetLabel}`}
          </p>
        </div>
        <div className="text-sm text-muted-foreground sm:text-right">
          <p>
            <span className="font-semibold text-foreground">{used}</span> used ·{" "}
            <span className="font-semibold text-foreground">{remaining}</span> left ·{" "}
            <span className="font-semibold text-foreground">{included}</span> included
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            exhausted ? "bg-destructive" : "bg-gradient-brand"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {exhausted ? (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">
            You&apos;ve used all included minutes for this billing period. New AI
            calls are paused until your plan renews or you upgrade.
          </p>
          <Link
            href="/dashboard/billing"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
          >
            Upgrade plan
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
