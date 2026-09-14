import { FileWarning, Plus, ShieldCheck, UserCog } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { usePermissionCatalog } from "@/features/system-administration/hooks/admin-users.hooks";

export function AccessProfilesPage() {
  const catalogQuery = usePermissionCatalog();

  return (
    <div className="app-page">
      <PageHeading
        eyebrow={
          <>
            <span>Configuración</span>
            <span className="px-1">›</span>
            <span className="text-[var(--ui-primary)]">Perfiles</span>
          </>
        }
        title="Perfiles de acceso"
        description="Define combinaciones reutilizables de sistemas, módulos y acciones para estandarizar la asignación de permisos."
        actions={
          <Button asChild>
            <Link to="/app/perfiles/nuevo">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Diseñar perfil
            </Link>
          </Button>
        }
      />

      <Card className="border-brand-200 bg-brand-50/70 p-5">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[var(--ui-primary)] shadow-sm">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-[var(--ui-text-primary)]">
              Interfaz preparada sin inventar persistencia
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--ui-text-secondary)]">
              auth_service publica el catálogo Grupo → Módulo → Acción y la asignación directa por
              usuario, pero el contrato disponible no publica endpoints para crear, editar o
              eliminar perfiles reutilizables. Por ello esta versión permite diseñar la definición
              del perfil sin presentar datos ficticios como si estuvieran guardados.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <EmptyState
          icon={catalogQuery.isError ? FileWarning : UserCog}
          title={
            catalogQuery.isError
              ? "No fue posible consultar el catálogo"
              : "Aún no existe un servicio de perfiles"
          }
          description={
            catalogQuery.isError
              ? "Verifica la sesión y la disponibilidad de auth_service antes de diseñar un perfil."
              : "Cuando backend publique el contrato de perfiles, este espacio mostrará el listado real con alta, edición, duplicado, estatus y asignaciones."
          }
          tone={catalogQuery.isError ? "red" : "brand"}
          size="lg"
          action={
            !catalogQuery.isError ? (
              <Button variant="secondary" asChild>
                <Link to="/app/perfiles/nuevo">Abrir diseñador de perfil</Link>
              </Button>
            ) : undefined
          }
        />
      </Card>
    </div>
  );
}
