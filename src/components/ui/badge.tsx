import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        success: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
        warning: "bg-amber-50 text-amber-900 ring-1 ring-amber-200",
        neutral: "bg-secondary text-muted-foreground",
        dark: "bg-[#18181B] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
