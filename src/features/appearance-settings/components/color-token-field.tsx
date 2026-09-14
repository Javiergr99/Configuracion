import { Input } from "@/components/ui/input";
import { ContrastBadge } from "@/features/appearance-settings/components/contrast-badge";
import { getContrastLevel } from "@/features/appearance-settings/model/color-contrast";
import { cn } from "@/shared/lib/cn";

export function ColorTokenField({
  label,
  token,
  value,
  persistedValue,
  contrastAgainst,
  onChange,
}: {
  label: string;
  token: string;
  value: string;
  persistedValue: string;
  contrastAgainst: string;
  onChange: (value: string) => void;
}) {
  const edited = value.toLowerCase() !== persistedValue.toLowerCase();
  const contrastLevel = getContrastLevel(value, contrastAgainst);

  return (
    <div className="grid min-h-[58px] grid-cols-[minmax(0,1fr)_auto_28px_94px] items-center gap-2 border-b border-[var(--ui-border)] py-2.5 last:border-b-0">
      <div className="min-w-0 pr-1">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <p className="truncate text-[12px] font-semibold text-[var(--ui-text-primary)]">
            {label}
          </p>
          {edited ? (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">
              Editado
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 break-all font-mono text-[9px] leading-3 text-slate-400">{token}</p>
      </div>
      <ContrastBadge level={contrastLevel} />
      <label
        className="relative grid h-7 w-7 cursor-pointer place-items-center overflow-hidden rounded-full border border-slate-200 shadow-sm"
        title={`Seleccionar ${label}`}
      >
        <span className="absolute inset-0" style={{ backgroundColor: value }} aria-hidden="true" />
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={`Selector de color para ${label}`}
        />
      </label>
      <Input
        value={value.toUpperCase()}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Valor hexadecimal para ${label}`}
        maxLength={7}
        spellCheck={false}
        className={cn(
          "h-8 px-2 text-[11px] font-medium uppercase",
          !/^#[0-9a-f]{6}$/i.test(value) && "border-red-300",
        )}
      />
    </div>
  );
}
