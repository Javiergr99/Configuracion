import { ChevronRight, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { usePermissionCatalog } from "@/features/system-administration/hooks/admin-users.hooks";

export function PermissionCatalogPage() {
  const catalogQuery = usePermissionCatalog();

  return (
    <div className="app-page">
      <PageHeading
        eyebrow={
          <>
            <span>Configuración</span>
            <span className="px-1">›</span>
            <span className="text-[var(--ui-primary)]">Catálogo de permisos</span>
          </>
        }
        title="Catálogo de permisos"
        description="Consulta la jerarquía real Grupo → Módulo → Acción publicada por auth_service."
      />

      {catalogQuery.isLoading ? (
        <Card className="p-8 text-sm text-[var(--ui-text-secondary)]">Cargando catálogo...</Card>
      ) : catalogQuery.isError ? (
        <Card>
          <EmptyState
            icon={ShieldCheck}
            title="No fue posible consultar el catálogo"
            description="Verifica la disponibilidad de auth_service y que tu usuario cuente con VER_USUARIOS."
            tone="red"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {(catalogQuery.data ?? []).map((group) => (
            <Card key={group.id} className="overflow-hidden p-0">
              <div className="flex items-center gap-3 border-b border-[var(--ui-border)] px-5 py-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-[var(--ui-primary)]">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[var(--ui-text-primary)]">{group.name}</h2>
                  {group.description ? (
                    <p className="mt-0.5 text-xs text-[var(--ui-text-secondary)]">
                      {group.description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="divide-y divide-[var(--ui-border)]">
                {group.modules.map((module) => (
                  <div key={module.id} className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      <h3 className="text-sm font-semibold text-[var(--ui-text-primary)]">
                        {module.name}
                      </h3>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 pl-6">
                      {module.actions.map((action) => (
                        <span
                          key={action.id}
                          className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"
                          title={action.description}
                        >
                          {action.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
