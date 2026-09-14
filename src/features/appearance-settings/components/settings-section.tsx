import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export function SettingsSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("border-b border-[var(--ui-border)] pb-5 last:border-b-0 last:pb-0", className)}
    >
      <div className="mb-3">
        <h2 className="text-[12px] font-bold text-[var(--ui-text-primary)]">{title}</h2>
        {description ? (
          <p className="mt-1 text-[10px] leading-4 text-[var(--ui-text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
