import type { LucideIcon } from "lucide-react";
import { LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";

import { Card } from "@/components/ui/card";
import { cn } from "@/shared/lib/cn";

const toneClasses = {
  brand: "bg-brand-50 text-brand-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-emerald-600",
  slate: "bg-slate-100 text-slate-600",
  red: "bg-red-50 text-red-600",
} as const;

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "brand",
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div className="h-full" whileHover={{ y: -1 }} transition={{ duration: 0.16 }}>
        <Card className="h-full p-4 transition-colors hover:border-slate-300">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold leading-5 text-[var(--ui-text-secondary)]">
              {title}
            </p>
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                toneClasses[tone],
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2.5 text-[26px] font-bold leading-none tracking-tight text-[var(--ui-text-primary)]">
            {value}
          </p>
          <p className="mt-1.5 text-[11px] leading-4 text-[var(--ui-text-secondary)]">{detail}</p>
        </Card>
      </m.div>
    </LazyMotion>
  );
}
