import Link from "next/link";
import { CalendarRange } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { dateRangePresets, type DateRangeKey } from "@/lib/date-range";
import { cn } from "@/lib/utils";

export function DateRangeFilter({
  basePath,
  activeRange,
  from,
  to,
}: {
  basePath: string;
  activeRange: DateRangeKey;
  from?: string;
  to?: string;
}) {
  const presets = dateRangePresets();

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <CalendarRange className="size-4 text-primary" />
        <span>Date range</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Link
            key={preset.key}
            href={preset.key === "all" ? basePath : `${basePath}?range=${preset.key}`}
            className={cn(
              buttonVariants({
                variant: activeRange === preset.key ? "default" : "outline",
                size: "sm",
              })
            )}
          >
            {preset.label}
          </Link>
        ))}
      </div>

      <form
        action={basePath}
        method="get"
        className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center"
      >
        <input type="hidden" name="range" value="custom" />
        <Input
          type="date"
          name="from"
          defaultValue={from ?? ""}
          className="h-9 w-full sm:w-[10.5rem]"
          aria-label="From date"
        />
        <span className="hidden text-muted-foreground sm:inline">–</span>
        <Input
          type="date"
          name="to"
          defaultValue={to ?? ""}
          className="h-9 w-full sm:w-[10.5rem]"
          aria-label="To date"
        />
        <Button type="submit" variant="outline" size="sm" className="shrink-0">
          Apply
        </Button>
      </form>
    </Card>
  );
}
