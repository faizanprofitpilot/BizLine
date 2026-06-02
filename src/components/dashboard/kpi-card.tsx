import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <Card
      hover
      className={cn(
        "relative overflow-hidden p-6",
        accent && "ring-1 ring-primary/20"
      )}
    >
      {accent ? (
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gradient-brand opacity-15 blur-2xl" />
      ) : null}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-2xl",
            accent
              ? "bg-gradient-brand text-white shadow-soft"
              : "bg-secondary text-foreground"
          )}
        >
          <Icon className="size-5" strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
