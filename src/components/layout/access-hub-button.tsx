import { LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";
import { redirectToAccessHub } from "@/features/auth/services/auth-navigation";

export function AccessHubButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={redirectToAccessHub}
      className="shrink-0 gap-2 text-[var(--ui-text-secondary)] hover:text-[var(--ui-primary)]"
      aria-label="Volver a accesos disponibles"
      title="Volver a accesos disponibles"
    >
      <LayoutGrid className="h-4 w-4" aria-hidden="true" />
      <span>Accesos</span>
    </Button>
  );
}
