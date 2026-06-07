import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Website" },
  { number: 2, label: "Review" },
  { number: 3, label: "Go live" },
] as const;

export type OnboardingStep = 1 | 2 | 3;

export function OnboardingWizardStepper({ currentStep }: { currentStep: OnboardingStep }) {
  return (
    <nav aria-label="Onboarding progress" className="mb-10">
      <ol className="flex items-center justify-center gap-2 sm:gap-0">
        {STEPS.map((step, index) => {
          const isComplete = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isLast = index === STEPS.length - 1;

          return (
            <li key={step.number} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isComplete && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary",
                    !isComplete && !isCurrent && "border-border bg-muted/50 text-muted-foreground"
                  )}
                >
                  {isComplete ? <Check className="size-4" strokeWidth={2.5} /> : step.number}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium sm:text-sm",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "mx-3 hidden h-0.5 w-12 sm:block sm:w-20",
                    isComplete ? "bg-primary" : "bg-border"
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function OnboardingWizard({
  currentStep,
  title,
  description,
  children,
}: {
  currentStep: OnboardingStep;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-border/80 bg-card/40 px-8 py-8 backdrop-blur-sm lg:px-12">
        <div className="mx-auto max-w-4xl">
          <OnboardingWizardStepper currentStep={currentStep} />
          <h1 className="text-center font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mx-auto mt-2 max-w-2xl text-center text-base text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      <main className="flex-1 px-8 py-8 lg:px-12 lg:py-10">{children}</main>
    </>
  );
}
