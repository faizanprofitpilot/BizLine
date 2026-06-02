import { Badge } from "@/components/ui/badge";

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

export function OutcomeBadge({ outcome }: { outcome?: string | null }) {
  const v = normalize(outcome);
  if (v.includes("appointment") || v.includes("book"))
    return <Badge variant="success">{outcome}</Badge>;
  if (v.includes("lead"))
    return <Badge variant="default">{outcome}</Badge>;
  if (v.includes("urgent") || v.includes("emergency"))
    return <Badge variant="warning">{outcome}</Badge>;
  return <Badge variant="neutral">{outcome || "Unknown"}</Badge>;
}

export function UrgencyBadge({ urgency }: { urgency?: string | null }) {
  const v = normalize(urgency);
  if (v.includes("high") || v.includes("urgent"))
    return <Badge variant="warning">{urgency}</Badge>;
  return <Badge variant="neutral">{urgency || "Normal"}</Badge>;
}

export function SentimentBadge({ sentiment }: { sentiment?: string | null }) {
  const v = normalize(sentiment);
  if (v.includes("positive"))
    return <Badge variant="success">{sentiment}</Badge>;
  if (v.includes("negative"))
    return <Badge variant="warning">{sentiment}</Badge>;
  return <Badge variant="neutral">{sentiment || "Neutral"}</Badge>;
}
