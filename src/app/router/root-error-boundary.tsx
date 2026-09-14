import { AlertTriangle } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router";

import { AccessHubButton } from "@/components/layout/access-hub-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function RootErrorBoundary() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Se produjo un error inesperado.";

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6">
      <Card className="w-full max-w-xl p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-[var(--ui-text-primary)]">
          No fue posible cargar Configuración
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ui-text-secondary)]">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => window.location.assign("/app/dashboard")}>Reintentar</Button>
          <AccessHubButton />
        </div>
      </Card>
    </div>
  );
}
