import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  hover = false,
  ...props
}: React.ComponentProps<"div"> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card text-card-foreground shadow-soft",
        hover &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("p-6", className)} {...props} />;
}
