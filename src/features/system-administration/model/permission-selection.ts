import type {
  PermissionCatalogGroup,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";

export function emptyPermissionSelection(): PermissionSelection {
  return { groupIds: [], moduleIds: [], actionIds: [] };
}

export function normalizePermissionSelection(
  selection: PermissionSelection,
  catalog: PermissionCatalogGroup[],
): PermissionSelection {
  const groupIds = new Set(selection.groupIds);
  const moduleIds = new Set(selection.moduleIds);
  const actionIds = new Set(selection.actionIds);

  catalog.forEach((group) => {
    group.modules.forEach((module) => {
      if (module.actions.some((action) => actionIds.has(action.id))) {
        moduleIds.add(module.id);
        groupIds.add(group.id);
      }
      if (moduleIds.has(module.id)) groupIds.add(group.id);
    });
  });

  return {
    groupIds: [...groupIds],
    moduleIds: [...moduleIds],
    actionIds: [...actionIds],
  };
}

export function permissionSelectionEquals(a: PermissionSelection, b: PermissionSelection): boolean {
  const same = (left: string[], right: string[]) => {
    const aSet = new Set(left);
    const bSet = new Set(right);
    return aSet.size === bSet.size && [...aSet].every((value) => bSet.has(value));
  };
  return (
    same(a.groupIds, b.groupIds) && same(a.moduleIds, b.moduleIds) && same(a.actionIds, b.actionIds)
  );
}
