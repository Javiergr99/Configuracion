import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { userHasAction } from "@/features/auth/model/auth.selectors";

export function AppearanceAccessGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (!userHasAction(user, "ADMINISTRAR_USUARIOS")) {
    return (
      <Card className="p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-lg font-bold text-[var(--ui-text-primary)]">Acceso restringido</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--ui-text-secondary)]">
          La configuración visual está reservada para administradores con la acción
          ADMINISTRAR_USUARIOS o para SUPER_ADMIN.
        </p>
      </Card>
    );
  }

  return children;
}
