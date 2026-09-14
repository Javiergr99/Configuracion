import { useState } from "react";
import { ArrowLeft, Braces, Info, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/ui/page-heading";
import { Textarea } from "@/components/ui/textarea";
import { PermissionTree } from "@/features/system-administration/components/permission-tree";
import { usePermissionCatalog } from "@/features/system-administration/hooks/admin-users.hooks";
import {
  EMPTY_ACCESS_PROFILE_DRAFT,
  type AccessProfileDraft,
} from "@/features/access-profiles/model/access-profile.types";

function profileCode(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export function AccessProfileCreatePage() {
  const catalogQuery = usePermissionCatalog();
  const [draft, setDraft] = useState<AccessProfileDraft>(EMPTY_ACCESS_PROFILE_DRAFT);
  const [search, setSearch] = useState("");

  const counts = {
    groups: draft.selection.groupIds.length,
    modules: draft.selection.moduleIds.length,
    actions: draft.selection.actionIds.length,
  };

  const validateDefinition = () => {
    if (!draft.name.trim()) {
      toast.error("Asigna un nombre al perfil.");
      return;
    }

    if (!draft.code.trim()) {
      toast.error("Asigna una clave al perfil.");
      return;
    }

    if (!draft.selection.groupIds.length) {
      toast.error("Selecciona al menos un sistema o grupo.");
      return;
    }

    toast.success(
      "La definición es válida a nivel de frontend. La persistencia requiere el contrato de perfiles de backend.",
    );
  };

  return (
    <div className="app-page">
      <PageHeading
        eyebrow={
          <>
            <span>Configuración</span>
            <span className="px-1">›</span>
            <span>Perfiles</span>
            <span className="px-1">›</span>
            <span className="text-[var(--ui-primary)]">Nuevo perfil</span>
          </>
        }
        title="Diseñar perfil de acceso"
        description="Construye la definición funcional que después podrá persistirse y asignarse a usuarios cuando backend publique el contrato correspondiente."
        actions={
          <Button variant="secondary" asChild>
            <Link to="/app/perfiles">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Link>
          </Button>
        }
      />

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-[var(--ui-primary)]">
                <Braces className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[var(--ui-text-primary)]">
                  Identidad del perfil
                </h2>
                <p className="text-xs text-[var(--ui-text-secondary)]">
                  Nombre administrativo y clave técnica propuesta.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input
                id="profile-name"
                label="Nombre del perfil *"
                value={draft.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setDraft((current) => ({
                    ...current,
                    name,
                    code:
                      current.code === profileCode(current.name) ? profileCode(name) : current.code,
                  }));
                }}
                placeholder="Ej. Supervisor de Formato NNA"
              />

              <Input
                id="profile-code"
                label="Clave *"
                value={draft.code}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    code: profileCode(event.target.value),
                  }))
                }
                placeholder="SUPERVISOR_FORMATO_NNA"
              />
            </div>

            <div className="mt-4">
              <Textarea
                id="profile-description"
                label="Descripción"
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe el objetivo, alcance y tipo de usuario al que se asignará este perfil."
                rows={3}
              />
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--ui-border)] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-[var(--ui-text-primary)]">
                    Permisos del perfil
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--ui-text-secondary)]">
                    El árbol se alimenta del catálogo real publicado por auth_service.
                  </p>
                </div>

                <ShieldCheck className="h-5 w-5 text-[var(--ui-primary)]" aria-hidden="true" />
              </div>

              <div className="relative mt-4">
                <label htmlFor="profile-permission-search" className="sr-only">
                  Buscar sistema, módulo o acción
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="profile-permission-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar sistema, módulo o acción..."
                  className="focus-ring h-10 w-full rounded-lg border border-[var(--ui-border)] bg-white pl-9 pr-3 text-sm text-[var(--ui-text-primary)]"
                />
              </div>
            </div>

            <div className="p-5">
              {catalogQuery.isLoading ? (
                <p className="text-sm text-[var(--ui-text-secondary)]">
                  Cargando catálogo de permisos...
                </p>
              ) : catalogQuery.isError ? (
                <p className="text-sm text-red-700">
                  No fue posible cargar el catálogo vigente de auth_service.
                </p>
              ) : (
                <PermissionTree
                  catalog={catalogQuery.data ?? []}
                  selection={draft.selection}
                  onSelectionChange={(selection) =>
                    setDraft((current) => ({
                      ...current,
                      selection,
                    }))
                  }
                  search={search}
                />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-[var(--ui-text-primary)]">
              Resumen de la definición
            </h2>

            <dl className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-3 text-center">
                <dt className="text-[11px] text-[var(--ui-text-secondary)]">Sistemas</dt>
                <dd className="mt-1 text-xl font-bold text-[var(--ui-primary)]">{counts.groups}</dd>
              </div>
              <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-3 text-center">
                <dt className="text-[11px] text-[var(--ui-text-secondary)]">Módulos</dt>
                <dd className="mt-1 text-xl font-bold text-[var(--ui-primary)]">
                  {counts.modules}
                </dd>
              </div>
              <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-3 text-center">
                <dt className="text-[11px] text-[var(--ui-text-secondary)]">Acciones</dt>
                <dd className="mt-1 text-xl font-bold text-[var(--ui-primary)]">
                  {counts.actions}
                </dd>
              </div>
            </dl>

            <Button className="mt-5 w-full" onClick={validateDefinition}>
              Validar definición
            </Button>

            <Button
              className="mt-2 w-full"
              variant="secondary"
              disabled
              title="Pendiente de endpoint backend para perfiles."
            >
              Guardar perfil
            </Button>
          </Card>

          <Card className="border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-amber-950">Contrato pendiente</h3>
                <p className="mt-1 text-xs leading-5 text-amber-900/80">
                  Para habilitar Guardar perfil se requiere que backend publique el modelo,
                  endpoints CRUD y reglas de asignación de perfiles a usuarios. Esta pantalla no
                  simula esa persistencia.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
