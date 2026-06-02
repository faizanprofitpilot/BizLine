import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function MarketingHomePage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="text-sm font-semibold tracking-tight">
            CursorHackathon<span className="text-muted-foreground">.xyz</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "default" })}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ variant: "default", size: "default" })}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <section className="flex flex-col items-start gap-6">
          <p className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            AI phone receptionist for small businesses
          </p>
          <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Never Miss Another Customer Call
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
            Turn your website into a 24/7 AI receptionist in under 2 minutes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              Get started
            </Link>
            <Link
              href="#pricing"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              View pricing
            </Link>
          </div>
        </section>

        <div className="my-16 h-px w-full bg-border" />

        <section id="how-it-works" className="grid gap-6">
          <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <div className="text-sm font-medium">1. Paste your URL</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Provide your website or Google Business Profile link.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="text-sm font-medium">2. Review details</div>
              <p className="mt-2 text-sm text-muted-foreground">
                We structure your business info into a call-ready assistant.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="text-sm font-medium">3. Go live</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate a phone number and start answering calls instantly.
              </p>
            </div>
          </div>
        </section>

        <div className="my-16 h-px w-full bg-border" />

        <section id="features" className="grid gap-6">
          <h2 className="text-xl font-semibold tracking-tight">Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <div className="text-sm font-medium">Call summaries + transcripts</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Automatically log outcomes and get an email recap after every call.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="text-sm font-medium">Business-aware conversations</div>
              <p className="mt-2 text-sm text-muted-foreground">
                The receptionist answers using your services, hours, policies, and context.
              </p>
            </div>
          </div>
        </section>

        <div className="my-16 h-px w-full bg-border" />

        <section id="pricing" className="grid gap-6">
          <h2 className="text-xl font-semibold tracking-tight">Pricing</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6">
              <div className="text-sm font-semibold">Starter</div>
              <p className="mt-2 text-sm text-muted-foreground">100 minutes / month</p>
              <Link
                href="/signup"
                className={buttonVariants({
                  variant: "default",
                  size: "default",
                  className: "mt-5 w-full",
                })}
              >
                Choose Starter
              </Link>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="text-sm font-semibold">Growth</div>
              <p className="mt-2 text-sm text-muted-foreground">500 minutes / month</p>
              <Link
                href="/signup"
                className={buttonVariants({
                  variant: "default",
                  size: "default",
                  className: "mt-5 w-full",
                })}
              >
                Choose Growth
              </Link>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="text-sm font-semibold">Pro</div>
              <p className="mt-2 text-sm text-muted-foreground">2000 minutes / month</p>
              <Link
                href="/signup"
                className={buttonVariants({
                  variant: "default",
                  size: "default",
                  className: "mt-5 w-full",
                })}
              >
                Choose Pro
              </Link>
            </div>
          </div>
        </section>

        <div className="my-16 h-px w-full bg-border" />

        <section id="faq" className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">FAQ</h2>
          <div className="rounded-xl border bg-card p-6">
            <div className="text-sm font-medium">Do I need a subscription to go live?</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Yes — an active subscription is required before we create your receptionist.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} CursorHackathon.xyz</div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

