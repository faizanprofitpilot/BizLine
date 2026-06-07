import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const sizeMap = {
  sm: 32,
  md: 36,
  lg: 40,
} as const;

export function BrandLogo({
  showWordmark = true,
  wordmark = "Bizline",
  size = "md",
  href = "/",
  subtitle,
  className,
  imageClassName,
  wordmarkClassName,
  subtitleClassName,
}: {
  showWordmark?: boolean;
  wordmark?: string;
  size?: keyof typeof sizeMap;
  href?: string | null;
  subtitle?: string;
  className?: string;
  imageClassName?: string;
  wordmarkClassName?: string;
  subtitleClassName?: string;
}) {
  const px = sizeMap[size];

  const inner = (
    <>
      <Image
        src="/Logo.png"
        alt="Bizline"
        width={px}
        height={px}
        className={cn(
          "shrink-0 transition-transform group-hover:scale-105",
          imageClassName
        )}
        priority
      />
      {showWordmark ? (
        <div className={cn(subtitle ? "min-w-0" : "shrink-0")}>
          <span
            className={cn(
              "block whitespace-nowrap font-display text-sm font-semibold leading-tight lg:text-lg",
              wordmarkClassName
            )}
          >
            {wordmark}
          </span>
          {subtitle ? (
            <span
              className={cn(
                "block text-xs text-muted-foreground",
                subtitleClassName
              )}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("group flex items-center gap-2.5", className)}>
        {inner}
      </Link>
    );
  }

  return <div className={cn("flex items-center gap-2.5", className)}>{inner}</div>;
}
