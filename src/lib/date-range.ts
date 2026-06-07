export type DateRangeKey = "all" | "7d" | "30d" | "90d" | "custom";

export type DateRange = {
  key: DateRangeKey;
  label: string;
  start: Date | null;
  end: Date | null;
};

const PRESETS: { key: DateRangeKey; label: string; days?: number }[] = [
  { key: "all", label: "All time" },
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
];

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseDateRange(params: {
  range?: string;
  from?: string;
  to?: string;
}): DateRange {
  const range = (params.range ?? "all") as DateRangeKey;

  if (range === "custom" && params.from) {
    const start = startOfDay(new Date(params.from));
    const end = params.to ? endOfDay(new Date(params.to)) : endOfDay(new Date());
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const fromLabel = start.toLocaleDateString();
      const toLabel = end.toLocaleDateString();
      return {
        key: "custom",
        label: `${fromLabel} – ${toLabel}`,
        start,
        end,
      };
    }
  }

  const preset = PRESETS.find((p) => p.key === range) ?? PRESETS[0];
  if (!preset.days) {
    return { key: preset.key, label: preset.label, start: null, end: null };
  }

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - preset.days);
  start.setHours(0, 0, 0, 0);

  return {
    key: preset.key,
    label: preset.label,
    start,
    end,
  };
}

export function dateRangePresets() {
  return PRESETS;
}

export function buildDateRangeQuery(range: DateRange, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (range.key === "custom" && from) {
    params.set("range", "custom");
    params.set("from", from);
    if (to) params.set("to", to);
  } else if (range.key !== "all") {
    params.set("range", range.key);
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function filterCallsByDateRange<T extends { created_at: string }>(
  calls: T[],
  range: DateRange
): T[] {
  if (!range.start && !range.end) return calls;

  return calls.filter((call) => {
    const created = new Date(call.created_at);
    if (range.start && created < range.start) return false;
    if (range.end && created > range.end) return false;
    return true;
  });
}
