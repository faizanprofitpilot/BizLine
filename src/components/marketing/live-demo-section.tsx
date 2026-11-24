"use client";

import { useState } from "react";
import { Check, Copy, Phone } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const DEMO_PHONE_DISPLAY = "+1 (551) 310-5356";
export const DEMO_PHONE_E164 = "+15513105356";
export const DEMO_SECTION_ID = "live-demo";

export function LiveDemoSection() {
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(DEMO_PHONE_E164);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      id={DEMO_SECTION_ID}
      className="scroll-mt-24 border-y border-border/70 bg-[#F7F1E8]"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:px-10 lg:py-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Try it yourself
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Don&apos;t take our word for it. Call our AI.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Hear how BizLine answers real customer calls. Dial the number below
            and ask about business hours, HVAC services, or the Maintenance Club.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Demo receptionist configured for Sam&apos;s Air Control.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-primary/15 via-transparent to-primary/5 blur-xl" />
          <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 shadow-soft sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-soft">
                <Phone className="size-5" strokeWidth={2} />
              </div>
              <div className="flex items-center gap-1.5 pt-1" aria-hidden>
                <span className="h-3 w-0.5 animate-pulse-soft rounded-full bg-primary/40" />
                <span className="h-5 w-0.5 animate-pulse-soft rounded-full bg-primary/55 [animation-delay:120ms]" />
                <span className="h-7 w-0.5 animate-pulse-soft rounded-full bg-primary/70 [animation-delay:240ms]" />
                <span className="h-5 w-0.5 animate-pulse-soft rounded-full bg-primary/55 [animation-delay:360ms]" />
                <span className="h-3 w-0.5 animate-pulse-soft rounded-full bg-primary/40 [animation-delay:480ms]" />
              </div>
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Live demo line
            </p>
            <a
              href={`tel:${DEMO_PHONE_E164}`}
              className="mt-2 block font-display text-3xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary sm:text-4xl"
            >
              {DEMO_PHONE_DISPLAY}
            </a>
            <p className="mt-2 text-sm text-muted-foreground">
              Real telephone call. Not a website chat.
            </p>

            <div className="mt-6">
              <a
                href={`tel:${DEMO_PHONE_E164}`}
                className={cn(buttonVariants({ size: "lg" }), "w-full md:hidden")}
              >
                <Phone className="size-4" />
                Call the live demo
              </a>

              <button
                type="button"
                onClick={copyNumber}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "hidden w-full md:inline-flex"
                )}
                aria-live="polite"
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    Number copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Copy number to call
                  </>
                )}
              </button>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Calls may be recorded and processed by AI for demonstration
              purposes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
