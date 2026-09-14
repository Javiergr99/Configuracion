import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchField } from "@/components/ui/search-field";
import { SelectField } from "@/components/ui/select-field";
import {
  ADMIN_STATUS_CATALOG,
  type AdminUserFilterOptions,
  type AdminUserFilters,
} from "@/features/system-administration/model/admin-user.types";

const EMPTY_FILTERS: Pick<
  AdminUserFilters,
  "search" | "status" | "instanceId" | "entityId" | "groupId"
> = {
  search: "",
  status: "",
  instanceId: "",
  entityId: "",
  groupId: "",
};

function optionLabel(value: string, options: Array<{ value: string; label: string }>): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function AdminUsersFilters({
  draft,
  applied,
  options,
  onDraftChange,
  onApply,
  onClear,
}: {
  draft: AdminUserFilters;
  applied: AdminUserFilters;
  options: AdminUserFilterOptions;
  onDraftChange: (next: AdminUserFilters) => void;
  onApply: (next?: AdminUserFilters) => void;
  onClear: () => void;
}) {
  const statusOptions = ADMIN_STATUS_CATALOG.map((item) => ({
    value: item.status,
    label: item.name,
  }));
  const active: Array<{ key: keyof typeof EMPTY_FILTERS; label: string }> = [];
  if (applied.search) active.push({ key: "search", label: `Búsqueda: ${applied.search}` });
  if (applied.status)
    active.push({
      key: "status",
      label: `Estatus: ${statusOptions.find((item) => item.value === applied.status)?.label ?? applied.status}`,
    });
  if (applied.instanceId)
    active.push({
      key: "instanceId",
      label: `Instancia: ${optionLabel(applied.instanceId, options.instances)}`,
    });
  if (applied.entityId)
    active.push({
      key: "entityId",
      label: `Entidad: ${optionLabel(applied.entityId, options.entities)}`,
    });
  if (applied.groupId)
    active.push({
      key: "groupId",
      label: `Grupo: ${optionLabel(applied.groupId, options.groups)}`,
    });

  const set = <K extends keyof AdminUserFilters>(key: K, value: AdminUserFilters[K]) => {
    onDraftChange({ ...draft, [key]: value, page: 1 });
  };

  return (
    <Card className="space-y-5 p-6">
      <SearchField
        value={draft.search}
        onChange={(value) => set("search", value)}
        label="Búsqueda rápida"
        placeholder="Buscar por nombre, CURP o correo electrónico..."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectField
          label="Estatus"
          value={draft.status || "all"}
          onValueChange={(value) =>
            set("status", value === "all" ? "" : (value as AdminUserFilters["status"]))
          }
          options={[{ value: "all", label: "Todos" }, ...statusOptions]}
        />
        <SelectField
          label="Instancia"
          value={draft.instanceId || "all"}
          onValueChange={(value) => set("instanceId", value === "all" ? "" : value)}
          options={[{ value: "all", label: "Todas" }, ...options.instances]}
        />
        <SelectField
          label="Entidad federativa"
          value={draft.entityId || "all"}
          onValueChange={(value) => set("entityId", value === "all" ? "" : value)}
          options={[{ value: "all", label: "Todas" }, ...options.entities]}
        />
        <SelectField
          label="Grupo"
          value={draft.groupId || "all"}
          onValueChange={(value) => set("groupId", value === "all" ? "" : value)}
          options={[{ value: "all", label: "Todos" }, ...options.groups]}
        />
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
        Los filtros y la paginación se aplican en el navegador sobre la lista autorizada devuelta
        por GET /users. auth_service v1.0 todavía no publica filtros ni paginación de servidor.
      </div>
      <div className="flex flex-col gap-4 border-t border-[var(--ui-border)] pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--ui-text-secondary)]">
            Filtros activos:
          </span>
          {active.length ? (
            active.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className="focus-ring inline-flex items-center gap-1 rounded-md border border-[var(--ui-primary)] bg-[var(--ui-primary-soft)] px-2.5 py-1.5 text-xs font-medium text-[var(--ui-primary)]"
                onClick={() => {
                  const next: AdminUserFilters = { ...applied, [key]: "", page: 1 };
                  onDraftChange(next);
                  onApply(next);
                }}
              >
                {label} <X className="h-3 w-3" />
              </button>
            ))
          ) : (
            <span className="text-xs text-slate-400">Ninguno</span>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              onDraftChange({ ...draft, ...EMPTY_FILTERS, page: 1 });
              onClear();
            }}
          >
            Limpiar filtros
          </Button>
          <Button onClick={() => onApply()}>Aplicar filtros</Button>
        </div>
      </div>
    </Card>
  );
}
