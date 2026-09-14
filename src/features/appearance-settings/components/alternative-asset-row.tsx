import { useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";

export function AlternativeAssetRow({
  label,
  initialStatus = "Cargado",
}: {
  label: string;
  initialStatus?: "Cargado" | "Pendiente";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"Cargado" | "Pendiente">(initialStatus);

  return (
    <div className="flex min-h-9 items-center gap-2 border-b border-[var(--ui-border)] py-1.5 last:border-b-0">
      <span
        className="h-5 w-5 rounded border border-[var(--ui-border)] bg-slate-50"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-[var(--ui-text-primary)]">
        {label}
      </span>
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[8px] font-bold",
          status === "Cargado" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600",
        )}
      >
        {status}
      </span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="focus-ring text-[9px] font-semibold text-[var(--ui-primary)] hover:underline"
      >
        Subir
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".svg,.png,.webp"
        aria-label={`Subir ${label}`}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files?.[0]) setStatus("Cargado");
          event.target.value = "";
        }}
      />
    </div>
  );
}
