import { Check } from "lucide-react";

import { cn } from "@/shared/lib/cn";

const steps = ["Datos del usuario", "Alcance y perfil", "Permisos", "Revisión"] as const;

export function AdminUserCreateStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-6 py-5 shadow-sm">
      <ol className="grid grid-cols-4 items-center gap-3" aria-label="Progreso del registro">
        {steps.map((label, index) => {
          const step = index + 1;
          const complete = step < currentStep;
          const active = step === currentStep;
          return (
            <li key={label} className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                  complete && "border-emerald-500 bg-emerald-500 text-white",
                  active && "border-[var(--ui-primary)] bg-[var(--ui-primary)] text-white",
                  !complete && !active && "border-slate-400 bg-white text-slate-600",
                )}
                aria-current={active ? "step" : undefined}
              >
                {complete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : step}
              </span>
              <span
                className={cn(
                  "truncate text-sm font-medium",
                  complete && "text-emerald-600",
                  active && "font-bold text-[var(--ui-primary)]",
                  !complete && !active && "text-[var(--ui-text-secondary)]",
                )}
              >
                {label}
              </span>
              {step < steps.length ? (
                <span
                  className={cn(
                    "h-px min-w-8 flex-1",
                    complete ? "bg-emerald-500" : "bg-slate-300",
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
