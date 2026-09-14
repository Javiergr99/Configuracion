import { useState } from "react";

import { cn } from "@/shared/lib/cn";

const contexts = ["Dashboard", "Formulario", "Tabla", "Perfil"] as const;
const states = ["Normal", "Hover", "Focus", "Error"] as const;

type PreviewState = (typeof states)[number];

export function SettingsPreview() {
  const [context, setContext] = useState<(typeof contexts)[number]>("Dashboard");
  const [previewState, setPreviewState] = useState<PreviewState>("Normal");

  const stateClass = {
    Normal: "border-[var(--ui-border)]",
    Hover: "border-[var(--ui-primary)] shadow-sm",
    Focus: "border-[var(--ui-primary)] ring-2 ring-[var(--ui-focus-ring)]",
    Error: "border-[var(--ui-danger)]",
  }[previewState];

  return (
    <div className="sticky top-0 rounded-[var(--ui-card-radius)] border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 shadow-[var(--ui-card-shadow)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-bold text-[var(--ui-text-primary)]">Vista previa</h2>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Tiempo real
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 rounded-md bg-slate-100 p-0.5">
        {contexts.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setContext(item)}
            className={cn(
              "focus-ring rounded-[5px] px-2 py-1.5 text-[10px] font-medium text-slate-500",
              context === item && "bg-white font-semibold text-slate-700 shadow-sm",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        <span>Estado:</span>
        {states.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPreviewState(item)}
            className={cn(
              "focus-ring rounded-full px-2 py-1 normal-case tracking-normal text-slate-500",
              previewState === item && "bg-brand-50 text-[var(--ui-primary)] ring-1 ring-brand-200",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        className={cn("mt-3 overflow-hidden rounded-lg border bg-[var(--ui-canvas)]", stateClass)}
      >
        <div className="flex h-7 items-center justify-between border-b border-[var(--ui-border)] bg-[var(--ui-header)] px-2.5">
          <div className="flex items-center gap-1.5">
            <span className="grid h-3.5 w-3.5 place-items-center rounded-[3px] bg-[var(--ui-primary)] text-[6px] font-bold text-[var(--ui-text-on-primary)]">
              M
            </span>
            <span className="text-[7px] font-bold text-[var(--ui-text-primary)]">
              Ecosistema DGCP
            </span>
          </div>
          <span className="h-3 w-3 rounded-full bg-slate-200" />
        </div>

        <div className="grid min-h-[310px] grid-cols-[52px_1fr]">
          <aside className="bg-[var(--ui-sidebar)] p-2">
            <div className="space-y-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-sm",
                      item === 0 ? "bg-white" : "bg-[var(--ui-sidebar-text)] opacity-80",
                    )}
                  />
                  <span className="h-1 w-5 rounded bg-[var(--ui-sidebar-text)] opacity-70" />
                </div>
              ))}
            </div>
          </aside>
          <section className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-[10px] font-bold text-[var(--ui-text-primary)]">
                  {context === "Dashboard" ? "Detalle del Registro" : context}
                </h3>
                <p className="mt-0.5 text-[6px] text-[var(--ui-text-secondary)]">
                  Folio: ATN-2026-01248
                </p>
              </div>
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[6px] font-semibold text-[var(--ui-primary)]">
                En proceso
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded border border-[var(--ui-border)] bg-[var(--ui-surface)] p-2">
                <p className="text-[6px] text-[var(--ui-text-secondary)]">Estatus general</p>
                <div className="mt-1.5 h-2 w-14 rounded bg-brand-50" />
              </div>
              <div className="rounded border border-[var(--ui-border)] bg-[var(--ui-surface)] p-2">
                <p className="text-[6px] text-[var(--ui-text-secondary)]">Acciones rápidas</p>
                <div className="mt-1.5 flex gap-1">
                  <span className="h-3 flex-1 rounded bg-[var(--ui-primary)]" />
                  <span className="h-3 flex-1 rounded border border-[var(--ui-border)] bg-[var(--ui-surface)]" />
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <div className="rounded border border-emerald-400 bg-emerald-50 px-1 py-1 text-center text-[6px] font-semibold text-emerald-600">
                Éxito
              </div>
              <div className="rounded border border-amber-400 bg-amber-50 px-1 py-1 text-center text-[6px] font-semibold text-amber-600">
                Alerta
              </div>
              <div className="rounded border border-red-400 bg-red-50 px-1 py-1 text-center text-[6px] font-semibold text-red-600">
                Error
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
