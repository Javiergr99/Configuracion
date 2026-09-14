import { Check, X } from "lucide-react";

import type { ContrastLevel } from "@/features/appearance-settings/model/color-contrast";
import { cn } from "@/shared/lib/cn";

export function ContrastBadge({ level }: { level: ContrastLevel }) {
  const passed = level !== "fail";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-0.5 rounded px-1.5 text-[10px] font-bold",
        passed ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500",
      )}
      title={
        level === "aa"
          ? "Cumple WCAG AA"
          : level === "large"
            ? "Cumple para texto grande"
            : "Contraste insuficiente"
      }
    >
      AA
      {passed ? (
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      ) : (
        <X className="h-2.5 w-2.5" strokeWidth={3} />
      )}
    </span>
  );
}
