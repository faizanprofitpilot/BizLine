"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone, Loader2, PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ProvisionButton({
  alreadyProvisioned,
  phoneNumber,
}: {
  alreadyProvisioned: boolean;
  phoneNumber?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(phoneNumber ?? null);
  const [celebrate, setCelebrate] = useState(false);

  const display = result ?? phoneNumber;

  if (alreadyProvisioned || display) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-accent/40 p-8 text-center shadow-glow">
        {celebrate ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl opacity-30">
            ✦ ✧ ✦
          </div>
        ) : null}
        <div className="relative mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-soft">
          {celebrate ? (
            <PartyPopper className="size-6" />
          ) : (
            <Phone className="size-6" />
          )}
        </div>
        <p className="relative text-sm font-semibold uppercase tracking-widest text-primary">
          Your line is live
        </p>
        <p className="relative mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
          {display}
        </p>
        <p className="relative mt-3 text-sm text-muted-foreground">
          Call this number to test your AI receptionist.
        </p>
      </div>
    );
  }

  async function provision() {
    setLoading(true);
    try {
      const res = await fetch("/api/twilio/provision", { method: "POST" });
      const data = (await res.json()) as {
        phoneNumber?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Provision failed");
      if (data.phoneNumber) {
        setResult(data.phoneNumber);
        setCelebrate(true);
        router.refresh();
      }
    } catch {
      setLoading(false);
      return;
    }
    setLoading(false);
  }

  return (
    <Button
      type="button"
      size="lg"
      disabled={loading}
      onClick={provision}
      className="w-full sm:w-auto"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Provisioning number…
        </>
      ) : (
        <>
          <Phone className="size-4" />
          Generate phone number
        </>
      )}
    </Button>
  );
}
