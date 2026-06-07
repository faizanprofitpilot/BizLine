"use client";

import { usePathname } from "next/navigation";

import {
  OnboardingWizard,
  type OnboardingStep,
} from "@/components/dashboard/onboarding-wizard";

function stepFromPathname(pathname: string): OnboardingStep {
  if (pathname.endsWith("/live")) return 3;
  if (pathname.endsWith("/review")) return 2;
  return 1;
}

const STEP_COPY: Record<OnboardingStep, { title: string; description: string }> = {
  1: {
    title: "Set up your receptionist",
    description:
      "Paste your website or Google Business Profile—we'll learn your business in seconds.",
  },
  2: {
    title: "Your AI receptionist profile",
    description: "Review and refine. Every field shapes how callers are greeted.",
  },
  3: {
    title: "Go live",
    description: "Generate your dedicated phone number and start taking calls.",
  },
};

export function OnboardingWizardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStep = stepFromPathname(pathname);
  const { title, description } = STEP_COPY[currentStep];

  return (
    <OnboardingWizard currentStep={currentStep} title={title} description={description}>
      {children}
    </OnboardingWizard>
  );
}
