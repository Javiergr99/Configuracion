import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-1.5 text-xs text-[var(--ui-text-secondary)]">{eyebrow}</div>
        ) : null}

        <h1 className="text-[22px] font-bold tracking-tight text-[var(--ui-text-primary)] sm:text-2xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-1 max-w-4xl text-[13px] leading-5 text-[var(--ui-text-secondary)] sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
