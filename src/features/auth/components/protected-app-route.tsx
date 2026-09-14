import { useEffect, type ReactNode } from "react";
import { LoaderCircle, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { redirectToAuthLogin } from "@/features/auth/services/auth-navigation";

function SessionLoading({ exchanging }: { exchanging: boolean }) {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6">
      <div className="flex flex-col items-center text-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-[var(--ui-primary)]" />
        <h1 className="mt-4 text-lg font-bold text-[var(--ui-text-primary)]">
          {exchanging ? "Conectando tu sesión" : "Verificando tu sesión"}
        </h1>
        <p className="mt-1 text-sm text-[var(--ui-text-secondary)]">
          {exchanging
            ? "Estamos validando el código seguro y cargando tus permisos."
            : "Espera un momento mientras confirmamos tu acceso."}
        </p>
      </div>
    </div>
  );
}

export function ProtectedAppRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  useEffect(() => {
    if (status === "anonymous") redirectToAuthLogin();
  }, [status]);

  if (status === "checking" || status === "exchanging") {
    return <SessionLoading exchanging={status === "exchanging"} />;
  }

  if (status === "error") {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-6">
        <Card className="w-full max-w-lg p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-[var(--ui-text-primary)]">
            No fue posible iniciar la sesión
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--ui-text-secondary)]">
            {error ?? "El código de acceso pudo expirar o ya fue utilizado."}
          </p>
          <Button className="mt-6" onClick={() => redirectToAuthLogin()}>
            Volver al inicio de sesión
          </Button>
        </Card>
      </div>
    );
  }

  if (status !== "authenticated") return <SessionLoading exchanging={false} />;
  return children;
}
