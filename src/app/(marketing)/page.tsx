import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Check,
  FileText,
  Mail,
  MessageSquare,
  Play,
  Sparkles,
} from "lucide-react";

import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import { HeroFlowVisual } from "@/components/marketing/hero-flow-visual";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  {
    n: "01",
    title: "Paste website",
    body: "Drop your homepage URL. We read your services, hours, and tone of voice.",
  },
  {
    n: "02",
    title: "AI learns your business",
    body: "We structure your brand into a receptionist profile you can edit in seconds.",
  },
  {
    n: "03",
    title: "Generate phone number",
    body: "Provision a dedicated line wired to your assistant—no hardware required.",
  },
  {
    n: "04",
    title: "Start taking calls",
    body: "Every call is summarized, classified, and emailed to you automatically.",
  },
];

const features = [
  {
    title: "Call summaries",
    desc: "AI summary after every call, with outcome, urgency, and sentiment.",
    icon: MessageSquare,
  },
  {
    title: "Full transcripts",
    desc: "Complete transcripts saved in your dashboard for every conversation.",
    icon: FileText,
  },
  {
    title: "AI receptionist",
    desc: "A dedicated voice line that answers calls around the clock.",
    icon: Sparkles,
  },
  {
    title: "Business knowledge",
    desc: "Onboarding pulls from your website—you review and edit before going live.",
    icon: BookOpen,
  },
  {
    title: "Lead & booking capture",
    desc: "Calls are classified so you can spot leads and appointment requests quickly.",
    icon: Calendar,
  },
  {
    title: "Email notifications",
    desc: "Summary email sent to your account when a call ends.",
    icon: Mail,
  },
];

const plans = [
  {
    name: "Starter",
    price: "$49",
    minutes: "100 minutes / month",
    highlight: false,
    features: [
      "1 AI receptionist",
      "1 dedicated phone number",
      "Website or Google Business onboarding",
      "Call summaries & full transcripts",
      "Email notification per call",
      "Dashboard call history",
    ],
  },
  {
    name: "Growth",
    price: "$149",
    minutes: "500 minutes / month",
    highlight: true,
    features: [
      "Everything in Starter",
      "5× more included minutes",
      "Same receptionist, number, and dashboard",
    ],
  },
  {
    name: "Pro",
    price: "$399",
    minutes: "2,000 minutes / month",
    highlight: false,
    features: [
      "Everything in Starter",
      "20× more included minutes",
      "Built for higher call volume",
    ],
  },
];

export default function MarketingHomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.12),transparent)]" />
        <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-24">
          <div className="max-w-xl">
            <p className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-soft">
              <Bell className="size-4 text-primary" />
              AI phone receptionist for small business
            </p>
            <h1 className="animate-fade-up-delay-1 font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
              Never miss another customer call.
            </h1>
            <p className="animate-fade-up-delay-2 mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Turn your website into a 24/7 AI receptionist in under 2 minutes.
            </p>
            <div className="animate-fade-up-delay-3 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup" className={cn(buttonVariants({ size: "xl" }))}>
                Get started
                <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
              </Link>
              <Link
                href="#how-it-works"
                className={cn(buttonVariants({ variant: "outline", size: "xl" }))}
              >
                <Play className="size-4" />
                Watch demo
              </Link>
            </div>
          </div>
          <div className="animate-fade-up-delay-2 lg:justify-self-end">
            <HeroFlowVisual />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            From URL to live line in four steps
          </h2>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-border lg:left-8 lg:block" />
          <div className="grid gap-10 lg:gap-14">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className="relative grid gap-6 lg:grid-cols-[auto_1fr] lg:gap-12"
              >
                <div className="flex items-start gap-6 lg:gap-10">
                  <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand font-display text-lg font-semibold text-white shadow-soft">
                    {step.n}
                  </div>
                  <div className="flex-1 pt-1 lg:max-w-xl">
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block">
                  {i === 0 ? (
                    <Card className="ml-auto max-w-sm p-5 font-mono text-xs text-muted-foreground">
                      https://yourbusiness.com
                    </Card>
                  ) : i === 1 ? (
                    <Card className="ml-auto max-w-sm space-y-2 p-5">
                      <div className="h-2 w-3/4 rounded-full bg-border" />
                      <div className="h-2 w-full rounded-full bg-border" />
                      <div className="h-2 w-5/6 rounded-full bg-primary/30" />
                    </Card>
                  ) : i === 2 ? (
                    <Card className="ml-auto max-w-sm p-5 text-center">
                      <p className="font-display text-2xl font-semibold">+1 (555) 012-3456</p>
                    </Card>
                  ) : (
                    <Card className="ml-auto max-w-sm p-5">
                      <p className="text-sm font-medium">New call summary</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Appointment request — caller interested in consultation.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section className="bg-[#18181B] py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Product
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              An operations console you&apos;ll love opening
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Calls, leads, and transcripts in one warm, focused workspace—built for
              owners, not engineers.
            </p>
          </div>
          <div className="mt-14">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Everything a modern receptionist should do
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} hover className="flex h-full flex-col p-8">
                <Icon className="size-8 text-primary" strokeWidth={1.75} />
                <div className="mt-6 flex flex-1 flex-col">
                  <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple plans. Serious value.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              hover
              className={cn(
                "relative flex flex-col p-8",
                plan.highlight && "shadow-glow ring-2 ring-primary/30"
              )}
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-4 py-1 text-xs font-semibold text-white shadow-soft">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-4 font-display text-5xl font-semibold tracking-tight">
                {plan.price}
                <span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{plan.minutes}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({
                    variant: plan.highlight ? "default" : "outline",
                    size: "lg",
                  }),
                  "mt-8 w-full"
                )}
              >
                Get started
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-brand px-8 py-16 text-center shadow-elevated sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
          <h2 className="relative font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Your next customer is calling. Answer every time.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/85">
            Launch your AI receptionist tonight. No hardware. No hold music. Just
            results.
          </p>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: "secondary", size: "xl" }),
              "relative mt-10 bg-white text-foreground hover:bg-white/95"
            )}
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row lg:px-10">
          <span>© {new Date().getFullYear()} Bizline</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
