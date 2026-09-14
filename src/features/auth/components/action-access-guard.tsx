import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { userHasAction } from "@/features/auth/model/auth.selectors";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { sessionHasExactAction } from "@/features/auth/services/jwt-actions";

export function ActionAccessGuard({
  action,
  exact = false,
  children,
  moduleTitle,
  moduleDescription,
}: {
  action: string;
  exact?: boolean;
  children: ReactNode;
  moduleTitle?: string;
  moduleDescription?: string;
}) {
  const user = useAuthStore((state) => state.user);
  const allowed = exact ? sessionHasExactAction(user, action) : userHasAction(user, action);

  if (!allowed) {
    return (
      <div className="app-page">
        {moduleTitle ? (
          <PageHeading
            eyebrow={
              <>
                <span>Dashboard</span> <span className="px-1">›</span>{" "}
                <span className="text-brand-600">{moduleTitle}</span>
              </>
            }
            title={moduleTitle}
            description={moduleDescription}
          />
        ) : null}

        <Card>
          <EmptyState
            icon={ShieldAlert}
            title="Acceso restringido"
            description="Su perfil no cuenta con permisos para consultar este módulo. Contacte al administrador del sistema para solicitar acceso o cambiar su perfil."
            tone="slate"
            size="lg"
            action={
              <Button variant="secondary" asChild>
                <Link to="/app/dashboard">Volver al Dashboard</Link>
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return children;
}
