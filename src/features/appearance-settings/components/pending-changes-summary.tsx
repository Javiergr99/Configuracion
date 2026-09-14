import { Circle } from "lucide-react";

export function PendingChangesSummary({ labels }: { labels: string[] }) {
  if (labels.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-3 text-[11px] text-emerald-700">
        Sin cambios pendientes.
      </div>
    );
  }

  const visible = labels.slice(0, 4);
  const remaining = labels.length - visible.length;

  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-3 text-[11px] text-amber-700">
      <Circle className="mt-1 h-2 w-2 shrink-0 fill-current" strokeWidth={0} aria-hidden="true" />
      <div className="min-w-0">
        <strong className="font-bold">Cambios pendientes: {labels.length}</strong>
        <p className="mt-0.5 leading-4">
          {visible.join(", ")}
          {remaining > 0 ? ` y ${remaining} más` : ""}.
        </p>
      </div>
    </div>
  );
}
