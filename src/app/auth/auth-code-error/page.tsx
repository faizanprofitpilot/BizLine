import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Link expired</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This verification link is invalid or has expired. Please request a new one.
      </p>
      <div className="mt-6 flex items-center gap-4 text-sm">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
        <Link
          href="/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          Reset password
        </Link>
      </div>
    </main>
  );
}

