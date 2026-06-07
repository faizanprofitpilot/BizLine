import { OnboardingWizardShell } from "@/components/dashboard/onboarding-wizard-shell";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingWizardShell>{children}</OnboardingWizardShell>;
}
