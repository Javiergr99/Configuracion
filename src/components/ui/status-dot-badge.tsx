import { cn } from "@/shared/lib/cn";

const tones = {
  success: "bg-emerald-50 text-emerald-600 before:bg-emerald-500",
  info: "bg-blue-50 text-blue-600 before:bg-blue-500",
  neutral: "bg-slate-100 text-slate-600 before:bg-slate-400",
  warning: "bg-amber-50 text-amber-600 before:bg-amber-500",
  danger: "bg-red-50 text-red-600 before:bg-red-500",
} as const;

export function StatusDotBadge({
  children,
  tone,
  className,
}: {
  children: string;
  tone: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:content-['']",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
