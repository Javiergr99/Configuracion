import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--ui-card-radius)] border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-[var(--ui-card-shadow)]",
        className,
      )}
      {...props}
    />
  );
}
