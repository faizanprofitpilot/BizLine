"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";

import { cn } from "@/lib/utils";

const SLIDES = [
  {
    src: "/illustration-overview.png",
    alt: "BizLine operations overview with call KPIs, recent calls, and a live phone line",
    label: "Overview",
    caption: "Calls, leads, and line status at a glance",
  },
  {
    src: "/illustration-calls.png",
    alt: "BizLine calls workspace with transcripts, outcomes, and summaries",
    label: "Calls",
    caption: "Every conversation summarized and ready to review",
  },
] as const;

const INTERVAL_MS = 5200;

export function DashboardMockup() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const onTick = useEffectEvent(() => {
    setIndex((current) => (current + 1) % SLIDES.length);
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    setProgressKey((key) => key + 1);
    const id = window.setInterval(() => onTick(), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, index]);

  const active = SLIDES[index];

  return (
    <div
      className="group relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[2.5rem] bg-gradient-to-b from-primary/20 via-transparent to-transparent opacity-80 blur-2xl" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0F0F12] shadow-elevated">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-white/20" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white/70">
                Operations Console
              </p>
              <p className="truncate text-[11px] text-white/35">{active.caption}</p>
            </div>
          </div>

          <div
            className="flex items-center gap-1 rounded-full bg-white/5 p-1"
            role="tablist"
            aria-label="Product screens"
          >
            {SLIDES.map((slide, i) => {
              const selected = i === index;
              return (
                <button
                  key={slide.label}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`Show ${slide.label} screen`}
                  onClick={() => {
                    setIndex(i);
                    setProgressKey((key) => key + 1);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide transition-colors",
                    selected
                      ? "bg-primary text-white shadow-soft"
                      : "text-white/45 hover:text-white/80"
                  )}
                >
                  {slide.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative aspect-[3024/1534] w-full overflow-hidden bg-[#F8F4ED]">
          {SLIDES.map((slide, i) => {
            const selected = i === index;
            return (
              <div
                key={slide.src}
                className={cn(
                  "absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  selected
                    ? "z-10 opacity-100 scale-100"
                    : "z-0 opacity-0 scale-[1.02] pointer-events-none"
                )}
                aria-hidden={!selected}
              >
                <Image
                  src={slide.src}
                  alt={selected ? slide.alt : ""}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className={cn(
                    "object-cover object-top",
                    !reduceMotion && selected && "animate-console-ken"
                  )}
                  priority={i === 0}
                />
              </div>
            );
          })}

          {!reduceMotion ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1 bg-black/10">
              <div
                key={progressKey}
                className={cn(
                  "h-full origin-left bg-primary",
                  paused ? "animate-console-progress-paused" : "animate-console-progress"
                )}
                style={{ animationDuration: `${INTERVAL_MS}ms` }}
              />
            </div>
          ) : null}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {active.label}: {active.caption}
      </p>
    </div>
  );
}
