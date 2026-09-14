import { SearchX } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6">
      <Card className="w-full max-w-xl">
        <EmptyState
          icon={SearchX}
          title="Página no encontrada"
          description="La ruta solicitada no pertenece al frontend de Configuración."
          size="lg"
          action={
            <Button asChild>
              <Link to="/app/dashboard">Ir a Configuración</Link>
            </Button>
          }
        />
      </Card>
    </div>
  );
}
