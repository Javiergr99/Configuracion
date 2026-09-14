import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, error, hint, id, ...props },
  ref,
) {
  return (
    <label className="block" htmlFor={id}>
      {label ? (
        <span className="mb-1.5 block text-xs font-semibold text-[var(--ui-text-secondary)]">
          {label}
        </span>
      ) : null}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "focus-ring min-h-28 w-full resize-y rounded-[var(--ui-control-radius)] border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2.5 text-sm text-[var(--ui-text-primary)] placeholder:text-slate-400 hover:border-slate-300",
          error && "border-[var(--ui-danger)]",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-[var(--ui-danger)]">{error}</span> : null}
      {!error && hint ? (
        <span className="mt-1 block text-xs text-[var(--ui-text-secondary)]">{hint}</span>
      ) : null}
    </label>
  );
});
