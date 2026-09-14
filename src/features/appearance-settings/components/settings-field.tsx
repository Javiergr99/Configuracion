import type { ReactNode } from "react";

export function SettingsField({
  label,
  edited = false,
  hint,
  children,
}: {
  label: string;
  edited?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-[var(--ui-text-primary)]">{label}</span>
        {edited ? (
          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold text-amber-600">
            Editado
          </span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="mt-1 text-[9px] leading-3.5 text-slate-400">{hint}</p> : null}
    </div>
  );
}
