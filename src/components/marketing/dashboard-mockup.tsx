import {
  BarChart3,
  Phone,
  PhoneIncoming,
  Sparkles,
} from "lucide-react";

export function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-[#18181B] shadow-elevated">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
        </div>
        <span className="ml-2 text-xs text-white/40">Operations Console</span>
      </div>

      <div className="flex min-h-[320px]">
        <aside className="hidden w-44 shrink-0 border-r border-white/10 p-4 sm:block">
          <div className="mb-6 text-xs font-semibold text-white/90">Receptionist</div>
          <div className="space-y-1">
            {["Overview", "Calls", "Settings"].map((item, i) => (
              <div
                key={item}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  i === 0
                    ? "bg-primary/20 text-primary"
                    : "text-white/40"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 bg-[#F8F4ED] p-5">
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Calls", value: "128", icon: PhoneIncoming },
              { label: "Leads", value: "34", icon: Sparkles },
              { label: "Minutes", value: "412", icon: BarChart3 },
              { label: "Number", value: "Live", icon: Phone },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-border bg-card p-3 shadow-soft"
              >
                <kpi.icon className="mb-2 size-4 text-primary" />
                <div className="font-display text-xl font-semibold text-foreground">
                  {kpi.value}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="mb-3 text-xs font-semibold text-foreground">
              Recent calls
            </div>
            <div className="space-y-2">
              {[
                { caller: "(555) 284-1092", outcome: "Appointment", time: "2m ago" },
                { caller: "(555) 901-4421", outcome: "Lead", time: "18m ago" },
                { caller: "(555) 773-0088", outcome: "Inquiry", time: "1h ago" },
              ].map((row) => (
                <div
                  key={row.caller}
                  className="flex items-center justify-between rounded-lg bg-background/80 px-3 py-2 text-xs"
                >
                  <span className="font-medium text-foreground">{row.caller}</span>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {row.outcome}
                  </span>
                  <span className="text-muted-foreground">{row.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
