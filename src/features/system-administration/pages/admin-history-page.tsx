import { Clock3, FileClock, ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";

export function AdminHistoryPage() {
  return (
    <div className="app-page">
      <PageHeading
        eyebrow={<span>Configuración &gt; Historial</span>}
        title="Historial administrativo"
        description="Espacio preparado para la auditoría institucional de operaciones administrativas."
      />

      <Card>
        <EmptyState
          icon={FileClock}
          title="Servicio de auditoría pendiente"
          description="El OpenAPI vigente de auth_service v1.0 no publica un servicio de auditoría administrativa. Esta pantalla no consume rutas futuras ni presenta registros ficticios."
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Clock3 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--ui-text-primary)]">Contrato vigente</p>
              <p className="mt-1 text-sm leading-6 text-[var(--ui-text-secondary)]">
                El historial se habilitará únicamente cuando la ruta aparezca en el OpenAPI
                publicado por backend.
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--ui-text-primary)]">
                Trazabilidad confiable
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--ui-text-secondary)]">
                No se utiliza localStorage como auditoría, porque no es compartido, autoritativo ni
                resistente a alteraciones.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
