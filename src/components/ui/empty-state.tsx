import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

const toneClasses = {
  brand: "bg-brand-50 text-brand-600",
  blue: "bg-blue-50 text-blue-600",
  red: "bg-red-50 text-red-500",
  slate: "bg-slate-100 text-slate-500",
  amber: "bg-amber-50 text-amber-600",
} as const;

const sizeClasses = {
  md: {
    root: "min-h-72 px-6 py-12",
    icon: "h-14 w-14 rounded-2xl",
    glyph: "h-6 w-6",
  },
  lg: {
    root: "min-h-[360px] px-6 py-16",
    icon: "h-24 w-24 rounded-full",
    glyph: "h-10 w-10",
  },
} as const;

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "brand",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  tone?: keyof typeof toneClasses;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn("flex flex-col items-center justify-center text-center", sizes.root, className)}
    >
      <span className={cn("grid place-items-center", sizes.icon, toneClasses[tone])}>
        <Icon className={sizes.glyph} aria-hidden="true" />
      </span>

      <h3 className="mt-5 text-lg font-bold text-[var(--ui-text-primary)]">{title}</h3>

      <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--ui-text-secondary)]">
        {description}
      </p>

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
