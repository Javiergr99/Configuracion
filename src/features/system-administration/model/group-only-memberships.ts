import type {
  PermissionCatalogGroup,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";

/**
 * Una membresía de grupo puede ser un acceso real sin módulos ni acciones.
 * Nunca se elimina automáticamente: la decisión es explícita del operador.
 */
export function groupOnlyMemberships(
  catalog: PermissionCatalogGroup[],
  selection: PermissionSelection,
): PermissionCatalogGroup[] {
  const groups = new Set(selection.groupIds);
  const modules = new Set(selection.moduleIds);
  const actions = new Set(selection.actionIds);

  return catalog.filter((group) =>
    groups.has(group.id) &&
    !group.modules.some((module) =>
      modules.has(module.id) || module.actions.some((action) => actions.has(action.id)),
    ),
  );
}

/**
 * Edita exclusivamente la selección pendiente. El backend solo se actualiza
 * cuando el operador guarda y se ejecutan sus controles habituales.
 */
export function removeGroupFromSelection(
  selection: PermissionSelection,
  group: PermissionCatalogGroup,
): PermissionSelection {
  const childModules = new Set(group.modules.map((module) => module.id));
  const childActions = new Set(
    group.modules.flatMap((module) => module.actions.map((action) => action.id)),
  );

  return {
    groupIds: selection.groupIds.filter((id) => id !== group.id),
    moduleIds: selection.moduleIds.filter((id) => !childModules.has(id)),
    actionIds: selection.actionIds.filter((id) => !childActions.has(id)),
  };
}
