import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <aside className="relative hidden w-[45%] overflow-hidden bg-[#18181B] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(249,115,22,0.35),transparent)]" />
        <BrandLogo
          className="relative"
          size="lg"
          imageClassName="group-hover:scale-100"
          wordmarkClassName="text-lg text-white"
        />
        <div className="relative max-w-md">
          <p className="font-display text-4xl font-semibold leading-tight tracking-tight text-white">
            Every call answered. Every lead captured.
          </p>
          <p className="mt-4 text-lg text-white/55">
            Your AI receptionist learns from your website and goes live in minutes.
          </p>
        </div>
        <p className="relative text-sm text-white/35">
          Trusted by thousands of small businesses
        </p>
      </aside>

      <main className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <BrandLogo
            className="mb-10 lg:hidden"
            size="sm"
            wordmarkClassName="text-lg text-foreground"
          />
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
