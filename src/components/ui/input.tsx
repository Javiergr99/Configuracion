import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, icon, id, ...props },
  ref,
) {
  return (
    <label className="block min-w-0" htmlFor={id}>
      {label ? (
        <span className="mb-1.5 block text-xs font-semibold text-[var(--ui-text-secondary)]">
          {label}
        </span>
      ) : null}
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ui-text-secondary)]">
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          className={cn(
            "focus-ring h-10 w-full rounded-[var(--ui-control-radius)] border border-[var(--ui-border)] bg-[var(--ui-field-bg)] px-3 text-sm text-[var(--ui-text-primary)] placeholder:text-slate-400 hover:border-slate-300",
            icon && "pl-10",
            error && "border-[var(--ui-danger)]",
            className,
          )}
          {...props}
        />
      </span>
      {error ? <span className="mt-1 block text-xs text-[var(--ui-danger)]">{error}</span> : null}
    </label>
  );
});
