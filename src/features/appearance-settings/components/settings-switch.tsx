import { cn } from "@/shared/lib/cn";

export function SettingsSwitch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "focus-ring relative h-5 w-9 rounded-full border transition",
        checked
          ? "border-[var(--ui-primary)] bg-[var(--ui-primary)]"
          : "border-slate-300 bg-slate-200",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[17px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
