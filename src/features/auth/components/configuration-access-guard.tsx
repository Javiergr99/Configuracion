import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

import { AccessHubButton } from "@/components/layout/access-hub-button";
import { Card } from "@/components/ui/card";
import { getUserActionNames } from "@/features/auth/model/auth.selectors";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { CONFIGURATION_ADMIN_ACTIONS } from "@/shared/config/navigation";

export function ConfigurationAccessGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const actions = new Set(getUserActionNames(user));

  const allowed =
    actions.has("SUPER_ADMIN") || CONFIGURATION_ADMIN_ACTIONS.some((action) => actions.has(action));

  if (allowed) return children;

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6">
      <Card className="w-full max-w-xl p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-700">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-[var(--ui-text-primary)]">
          Configuración restringida
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ui-text-secondary)]">
          Tu sesión es válida, pero no cuenta con acciones administrativas para ingresar al módulo
          de Configuración del Ecosistema Integral DGCP.
        </p>
        <div className="mt-6 flex justify-center">
          <AccessHubButton />
        </div>
      </Card>
    </div>
  );
}
