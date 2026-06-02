import Link from "next/link";

import { signupAction } from "@/app/(auth)/actions";
import { buttonVariants } from "@/components/ui/button";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create your account, then activate your plan to go live.
      </p>

      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <form action={signupAction} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-10 rounded-lg border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="h-10 rounded-lg border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <button type="submit" className={buttonVariants({ size: "lg" })}>
          Continue
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Already have an account?
        </Link>
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Back to home
        </Link>
      </div>
    </main>
  );
}

