import { useId } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/shared/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectOptionInput = SelectOption | string;

type SelectFieldProps = {
  id?: string;
  label?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options?: readonly SelectOptionInput[];
  placeholder?: string;
  error?: string | boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
};

function normalizeOption(option: SelectOptionInput): SelectOption {
  return typeof option === "string" ? { value: option, label: option } : option;
}

export function SelectField({
  id,
  label,
  value = "",
  onValueChange,
  options = [],
  placeholder = "Seleccione una opción",
  error,
  disabled = false,
  className,
  triggerClassName,
}: SelectFieldProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const errorId = `${triggerId}-error`;
  const normalizedOptions = options.map(normalizeOption);
  const selectedOption = normalizedOptions.find((option) => option.value === value);
  const errorMessage =
    typeof error === "string" ? error : error ? "Seleccione una opción válida." : "";

  return (
    <div className={cn("min-w-0", className)}>
      {label ? (
        <label
          htmlFor={triggerId}
          className="mb-1.5 block text-xs font-semibold text-[var(--ui-text-secondary)]"
        >
          {label}
        </label>
      ) : null}

      <SelectPrimitive.Root
        value={value}
        onValueChange={(nextValue) => {
          // Radix puede emitir temporalmente una cadena vacía cuando un formulario
          // controlado se hidrata con datos asíncronos. Ningún Item usa value="".
          if (nextValue === "") return;
          onValueChange(nextValue);
        }}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          id={triggerId}
          aria-label={label ? undefined : placeholder}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "focus-ring flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border bg-[var(--ui-surface)] px-3 text-left text-sm text-[var(--ui-text-primary)] outline-none transition-colors",
            "data-[placeholder]:text-[var(--ui-text-secondary)]",
            disabled
              ? "cursor-not-allowed border-[var(--ui-border)] bg-slate-50 opacity-60"
              : "cursor-pointer border-[var(--ui-border)] hover:border-slate-300",
            error && "border-red-400",
            triggerClassName,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder}>
            {selectedOption?.label}
          </SelectPrimitive.Value>

          <SelectPrimitive.Icon asChild>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-[var(--ui-text-secondary)]"
              aria-hidden="true"
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={5}
            align="start"
            collisionPadding={12}
            className={cn(
              "z-[100] flex min-w-[var(--radix-select-trigger-width)] flex-col overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-xl",
            )}
            style={{
              width: "var(--radix-select-trigger-width)",
              maxHeight: "min(20rem, var(--radix-select-content-available-height))",
            }}
          >
            <SelectPrimitive.ScrollUpButton className="flex h-8 shrink-0 cursor-default items-center justify-center border-b border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-secondary)]">
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport
              className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain p-1 app-scrollbar"
              onWheelCapture={(event) => {
                event.stopPropagation();
              }}
            >
              {normalizedOptions.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "relative flex min-h-9 w-full cursor-default select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-[var(--ui-text-primary)] outline-none",
                    "data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-950",
                    "data-[state=checked]:bg-brand-50 data-[state=checked]:text-brand-700",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  )}
                >
                  <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </SelectPrimitive.ItemIndicator>
                  </span>

                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="flex h-8 shrink-0 cursor-default items-center justify-center border-t border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-secondary)]">
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {errorMessage ? (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
