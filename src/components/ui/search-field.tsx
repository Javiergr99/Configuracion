import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/cn";

export function SearchField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("block min-w-0", className)}>
      {label ? (
        <span className="mb-1.5 block text-xs font-semibold text-[var(--ui-text-secondary)]">
          {label}
        </span>
      ) : null}
      <span className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ui-text-secondary)]" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="focus-ring h-11 w-full rounded-[var(--ui-control-radius)] border border-[var(--ui-border)] bg-[var(--ui-surface)] pl-10 pr-11 text-sm text-[var(--ui-text-primary)] placeholder:text-slate-400 hover:border-slate-300"
        />
        {value ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1 h-9 min-h-9 w-9"
            onClick={() => onChange("")}
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </span>
    </label>
  );
}
