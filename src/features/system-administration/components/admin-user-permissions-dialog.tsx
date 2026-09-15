import { ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SearchField } from "@/components/ui/search-field";
import { getAdminErrorMessage } from "@/features/system-administration/api/admin-api-error";
import { logoutCurrentSession } from "@/features/auth/services/session-commands";
import { PermissionTree } from "@/features/system-administration/components/permission-tree";
import {
  useAdminCurrentUser,
  usePermissionCatalog,
  useUpdatePermissionsMutation,
} from "@/features/system-administration/hooks/admin-users.hooks";
import { isSuperAdmin } from "@/features/system-administration/model/admin-authorization";
import { selectionFromUser } from "@/features/system-administration/model/admin-user.mapper";
import type {
  AdminUser,
  PermissionCatalogGroup,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";
import {
  buildPermissionOperationPlan,
  permissionOperationCount,
  type PermissionOperationPlan,
} from "@/features/system-administration/model/permission-operation-plan";
import {
  formatScopedPermissionRequirement,
  missingScopedRequirementsForPermissionPlan,
  type ScopedPermissionRequirement,
} from "@/features/system-administration/model/permission-scope";
import { permissionSelectionEquals } from "@/features/system-administration/model/permission-selection";

const EMPTY_PERMISSION_CATALOG: PermissionCatalogGroup[] = [];

type AdminUserPermissionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser;
};

type PermissionChangeCounts = {
  added: number;
  removed: number;
  operations: number;
};

function permissionChangeCounts(plan: PermissionOperationPlan): PermissionChangeCounts {
  return {
    added: plan.groupsToAdd.length + plan.modulesToAdd.length + plan.actionsToAdd.length,
    removed: plan.groupsToRemove.length + plan.modulesToRemove.length + plan.actionsToRemove.length,
    operations: permissionOperationCount(plan),
  };
}

function lockedSuperAdminActions({
  catalog,
  actorCanAssignSuperAdmin,
  originalActionIds,
}: {
  catalog: PermissionCatalogGroup[];
  actorCanAssignSuperAdmin: boolean;
  originalActionIds: Set<string>;
}) {
  const lockedIds = new Set<string>();

  for (const group of catalog) {
    for (const module of group.modules) {
      for (const action of module.actions) {
        if (
          action.name === "SUPER_ADMIN" &&
          (!actorCanAssignSuperAdmin || originalActionIds.has(action.id))
        ) {
          lockedIds.add(action.id);
        }
      }
    }
  }

  return lockedIds;
}

function PermissionDialogFooter({
  busy,
  disabled,
  onClose,
  onSave,
}: {
  busy: boolean;
  disabled: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
      <Button onClick={onSave} disabled={disabled}>
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        {busy ? "Guardando cambios..." : "Guardar permisos"}
      </Button>
    </>
  );
}

function PermissionEditorPane({
  search,
  onSearchChange,
  loading,
  catalog,
  selection,
  onSelectionChange,
  lockedActionIds,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  catalog: PermissionCatalogGroup[];
  selection: PermissionSelection;
  onSelectionChange: (next: PermissionSelection) => void;
  lockedActionIds: Set<string>;
}) {
  return (
    <div>
      <SearchField
        value={search}
        onChange={onSearchChange}
        label="Buscar acceso o permiso"
        placeholder="Buscar sistema, grupo, módulo o acción..."
      />
      <div className="mt-4 max-h-[52vh] overflow-y-auto pr-1 app-scrollbar">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Cargando catálogo vigente...</p>
        ) : (
          <PermissionTree
            catalog={catalog}
            selection={selection}
            onSelectionChange={onSelectionChange}
            search={search}
            lockedActionIds={lockedActionIds}
          />
        )}
      </div>
    </div>
  );
}

function PermissionChangeSummary({
  selection,
  counts,
}: {
  selection: PermissionSelection;
  counts: PermissionChangeCounts;
}) {
  return (
    <>
      <div>
        <p className="text-sm font-bold text-[var(--ui-text-primary)]">Resumen de selección</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Summary value={selection.groupIds.length} label="Grupos" />
          <Summary value={selection.moduleIds.length} label="Módulos" />
          <Summary value={selection.actionIds.length} label="Acciones" />
        </dl>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-3">
          <p className="text-lg font-bold text-emerald-700">+{counts.added}</p>
          <p className="text-[10px] font-semibold text-emerald-800">Por agregar</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-2 py-3">
          <p className="text-lg font-bold text-red-700">-{counts.removed}</p>
          <p className="text-[10px] font-semibold text-red-800">Por retirar</p>
        </div>
      </div>
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Cambios preparados
        </div>
        <p className="mt-1">
          Los cambios se validan antes de guardarse y se aplican juntos para evitar estados
          parciales.
        </p>
        <p className="mt-2 font-semibold">Cambios planificados: {counts.operations}</p>
      </div>
    </>
  );
}

function PermissionScopeWarnings({
  isSelfTarget,
  missingRequirements,
}: {
  isSelfTarget: boolean;
  missingRequirements: ScopedPermissionRequirement[];
}) {
  return (
    <>
      {isSelfTarget ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          <p className="font-bold">Tu sesión se actualizará al guardar</p>
          <p className="mt-1">
            Si modificas tus propios accesos, deberás iniciar sesión nuevamente para continuar. Tu
            permiso SUPER_ADMIN permanecerá protegido.
          </p>
        </div>
      ) : null}

      {missingRequirements.length ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">
          <p className="font-bold">No puedes aplicar esta combinación de cambios.</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {missingRequirements.map((requirement) => (
              <li key={`${requirement.action}:${requirement.groupId}`}>
                {formatScopedPermissionRequirement(requirement)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function PermissionDialogSidebar({
  selection,
  counts,
  isSelfTarget,
  missingRequirements,
}: {
  selection: PermissionSelection;
  counts: PermissionChangeCounts;
  isSelfTarget: boolean;
  missingRequirements: ScopedPermissionRequirement[];
}) {
  return (
    <aside className="space-y-5 rounded-xl border border-[var(--ui-border)] bg-slate-50 p-5">
      <PermissionChangeSummary selection={selection} counts={counts} />
      <PermissionScopeWarnings
        isSelfTarget={isSelfTarget}
        missingRequirements={missingRequirements}
      />
      <p className="text-xs leading-5 text-[var(--ui-text-secondary)]">
        Los permisos se validan antes de guardar. Si alguna combinación no está permitida, no se
        aplicará ningún cambio.
      </p>
    </aside>
  );
}

async function savePermissionChanges({
  user,
  original,
  selection,
  mutate,
  onComplete,
}: {
  user: AdminUser;
  original: PermissionSelection;
  selection: PermissionSelection;
  mutate: (input: {
    id: string;
    input: { original: PermissionSelection; next: PermissionSelection };
  }) => Promise<{
    user: AdminUser;
    complete: boolean;
    completedOperations: number;
    requiresReauthentication: boolean;
    warning?: string;
  }>;
  onComplete: () => void;
}) {
  if (permissionSelectionEquals(original, selection)) {
    toast.info("No hay cambios pendientes.");
    return;
  }

  try {
    const result = await mutate({ id: user.id, input: { original, next: selection } });

    if (!result.complete) {
      toast.warning(
        result.warning ?? "auth_service no confirmó la actualización completa de permisos.",
        { duration: 10000 },
      );
      return;
    }

    if (result.requiresReauthentication) {
      toast.success("Permisos actualizados. Por seguridad, debes iniciar sesión nuevamente.", {
        duration: 6000,
      });
      onComplete();
      await logoutCurrentSession("permissions-changed");
      return;
    }

    toast.success(
      `Permisos actualizados correctamente (${result.completedOperations} cambio(s) efectivo(s)).`,
    );
    onComplete();
  } catch (error) {
    toast.error(getAdminErrorMessage(error, "No fue posible actualizar los permisos."));
  }
}

export function AdminUserPermissionsDialog(props: AdminUserPermissionsDialogProps) {
  const sessionKey = `${props.user.id}:${props.open ? "open" : "closed"}`;
  return <AdminUserPermissionsDialogSession key={sessionKey} {...props} />;
}

function AdminUserPermissionsDialogSession({
  open,
  onOpenChange,
  user,
}: AdminUserPermissionsDialogProps) {
  const catalogQuery = usePermissionCatalog(open);
  const currentUserQuery = useAdminCurrentUser();
  const updateMutation = useUpdatePermissionsMutation();
  const [search, setSearch] = useState("");
  const [original] = useState<PermissionSelection>(() => selectionFromUser(user));
  const [selection, setSelection] = useState<PermissionSelection>(() => selectionFromUser(user));
  const catalog = catalogQuery.data ?? EMPTY_PERMISSION_CATALOG;
  const actor = currentUserQuery.data;
  const actorCanAssignSuperAdmin = isSuperAdmin(actor);
  const isSelfTarget = actor?.id === user.id;
  const originalActionIds = useMemo(() => new Set(original.actionIds), [original.actionIds]);
  const lockedActionIds = useMemo(
    () => lockedSuperAdminActions({ catalog, actorCanAssignSuperAdmin, originalActionIds }),
    [actorCanAssignSuperAdmin, catalog, originalActionIds],
  );
  const plan = useMemo(
    () => buildPermissionOperationPlan(original, selection, catalog),
    [catalog, original, selection],
  );
  const missingRequirements = useMemo(
    () => missingScopedRequirementsForPermissionPlan(plan, catalog, actor),
    [actor, catalog, plan],
  );
  const counts = permissionChangeCounts(plan);
  const unchanged = permissionSelectionEquals(original, selection);
  const saveDisabled =
    updateMutation.isPending ||
    catalogQuery.isLoading ||
    currentUserQuery.isLoading ||
    unchanged ||
    missingRequirements.length > 0;

  const save = () =>
    savePermissionChanges({
      user,
      original,
      selection,
      mutate: updateMutation.mutateAsync,
      onComplete: () => onOpenChange(false),
    });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Administrar accesos y permisos"
      description={`${user.fullName} · ${user.curp}`}
      widthClassName="max-w-5xl"
      footer={
        <PermissionDialogFooter
          busy={updateMutation.isPending}
          disabled={saveDisabled}
          onClose={() => onOpenChange(false)}
          onSave={() => void save()}
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <PermissionEditorPane
          search={search}
          onSearchChange={setSearch}
          loading={catalogQuery.isLoading}
          catalog={catalog}
          selection={selection}
          onSelectionChange={setSelection}
          lockedActionIds={lockedActionIds}
        />
        <PermissionDialogSidebar
          selection={selection}
          counts={counts}
          isSelfTarget={isSelfTarget}
          missingRequirements={missingRequirements}
        />
      </div>
    </Dialog>
  );
}

function Summary({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-[var(--ui-border)] bg-white px-2 py-3">
      <dd className="text-xl font-bold text-[var(--ui-primary)]">{value}</dd>
      <dt className="mt-1 text-[10px] font-semibold text-[var(--ui-text-secondary)]">{label}</dt>
    </div>
  );
}
