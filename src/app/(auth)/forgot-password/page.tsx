import Link from "next/link";

import { requestPasswordResetAction } from "@/app/(auth)/actions";
import { buttonVariants } from "@/components/ui/button";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We’ll email you a secure link to set a new password.
      </p>

      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {sent ? (
        <div className="mt-6 rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
          If that email exists, we sent a password reset link.
        </div>
      ) : null}

      <form action={requestPasswordResetAction} className="mt-6 grid gap-4">
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
        <button type="submit" className={buttonVariants({ size: "lg" })}>
          Send reset link
        </button>
      </form>

      <div className="mt-6 text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </main>
  );
}

