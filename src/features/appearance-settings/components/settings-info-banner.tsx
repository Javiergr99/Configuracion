import { Info } from "lucide-react";

export function SettingsInfoBanner({
  message = "Al publicarse, los cambios se aplicarán a todos los usuarios y módulos del sistema mediante la configuración global.",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-11 items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/60 px-4 text-[12px] text-blue-700">
      <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
