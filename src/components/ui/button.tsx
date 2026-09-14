import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/shared/lib/cn";

const buttonVariants = cva(
  "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--ui-control-radius)] border px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "border-[var(--ui-primary)] bg-[var(--ui-primary)] text-[var(--ui-text-on-primary)] shadow-sm hover:bg-[var(--ui-primary-hover)]",
        secondary:
          "border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-secondary)] shadow-sm hover:border-slate-300 hover:bg-slate-50",
        ghost:
          "border-transparent bg-transparent text-[var(--ui-text-secondary)] hover:bg-slate-100 hover:text-[var(--ui-text-primary)]",
        danger: "border-[var(--ui-danger)] bg-[var(--ui-danger)] text-white hover:brightness-90",
      },
      size: {
        sm: "min-h-9 px-3 text-xs",
        md: "min-h-10 px-4",
        lg: "min-h-11 px-5",
        icon: "h-9 min-h-9 w-9 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, type = "button", asChild = false, ...props },
  ref,
) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      ref={ref}
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});
