"use client";

import {
  Globe,
  Bot,
  Phone,
  PhoneCall,
  ArrowDown,
} from "lucide-react";

const steps = [
  { icon: Globe, label: "Website", sub: "Your business URL" },
  { icon: Bot, label: "AI Receptionist", sub: "Trained on your brand" },
  { icon: Phone, label: "Phone Number", sub: "Provisioned instantly" },
  { icon: PhoneCall, label: "Customer Call", sub: "Answered 24/7" },
];

export function HeroFlowVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-brand opacity-[0.12] blur-3xl" />
      <div className="relative rounded-[2rem] border border-border/80 bg-card p-8 shadow-elevated">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Live setup flow
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            Active
          </span>
        </div>

        <div className="flex flex-col gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <div key={step.label} className="flex flex-col items-center">
                <div
                  className="animate-flow-pulse flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-soft transition-transform duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${i * 0.35}s` }}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
                    <Icon className="size-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="font-semibold text-foreground">{step.label}</div>
                    <div className="text-sm text-muted-foreground">{step.sub}</div>
                  </div>
                </div>
                {!isLast ? (
                  <ArrowDown className="my-2 size-5 text-primary/40" strokeWidth={2} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
