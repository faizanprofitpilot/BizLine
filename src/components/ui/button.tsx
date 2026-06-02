import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-brand text-white shadow-soft hover:shadow-glow hover:brightness-[1.02]",
        outline:
          "border-border bg-card text-foreground shadow-soft hover:border-primary/30 hover:bg-accent/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:bg-[#ebe4d8]",
        ghost: "text-foreground hover:bg-muted/80",
        dark: "bg-[#18181B] text-white shadow-soft hover:bg-[#27272a]",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/15",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-5",
        sm: "h-9 gap-1.5 rounded-lg px-4 text-[0.8125rem]",
        lg: "h-12 gap-2 rounded-xl px-7 text-base",
        xl: "h-14 gap-2.5 rounded-2xl px-8 text-base",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
