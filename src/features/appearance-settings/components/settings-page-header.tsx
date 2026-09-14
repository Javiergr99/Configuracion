import type { ReactNode } from "react";

export function SettingsPageHeader({
  actions,
  description = "Personaliza la identidad visual global del Ecosistema Integral DGCP mediante Design Tokens reutilizables.",
}: {
  actions: ReactNode;
  description?: string;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-5">
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--ui-text-secondary)]">
          <span>Configuración</span>
          <span aria-hidden="true">›</span>
          <span>Apariencia</span>
          <span aria-hidden="true">›</span>
          <span className="font-semibold text-[var(--ui-primary)]">Configuración visual</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--ui-text-primary)]">
            Configuración visual
          </h1>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-[var(--ui-primary)]">
            Configuración global
          </span>
        </div>
        <p className="mt-1 max-w-[690px] text-[13px] leading-5 text-[var(--ui-text-secondary)]">
          {description}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 pt-5">{actions}</div>
    </div>
  );
}
