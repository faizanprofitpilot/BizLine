"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  Phone,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/calls", label: "Calls", icon: Phone },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export function DashboardSidebar({ businessName }: { businessName?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-dvh w-[260px] shrink-0 flex-col self-stretch bg-[#18181B] text-white">
      <div className="border-b border-white/10 p-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-sm font-bold shadow-soft">
            C
          </span>
          <div>
            <div className="font-display text-sm font-semibold leading-tight">
              CursorHackathon
            </div>
            <div className="text-xs text-white/45">Operations</div>
          </div>
        </Link>
        {businessName ? (
          <p className="mt-4 truncate text-sm text-white/70">{businessName}</p>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(249,115,22,0.25)]"
                  : "text-white/50 hover:bg-white/5 hover:text-white/90"
              )}
            >
              <Icon className={cn("size-[18px]", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/90"
          >
            <LogOut className="size-[18px]" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
