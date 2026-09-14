import type {
  PermissionCatalogGroup,
  PermissionCatalogModule,
} from "@/features/system-administration/model/admin-user.types";

export function selectableActionIdsForModule(
  module: PermissionCatalogModule,
  lockedActionIds: Set<string>,
): string[] {
  const actionIds: string[] = [];

  for (const action of module.actions) {
    if (action.assignable && !lockedActionIds.has(action.id)) {
      actionIds.push(action.id);
    }
  }

  return actionIds;
}

export function permissionGroupDescendants(
  group: PermissionCatalogGroup,
  lockedActionIds: Set<string>,
): {
  moduleIds: string[];
  actionIds: string[];
} {
  const moduleIds: string[] = [];
  const actionIds: string[] = [];

  for (const module of group.modules) {
    if (!module.assignable) continue;

    moduleIds.push(module.id);

    for (const action of module.actions) {
      if (action.assignable && !lockedActionIds.has(action.id)) {
        actionIds.push(action.id);
      }
    }
  }

  return {
    moduleIds,
    actionIds,
  };
}

export function withSelectionValues(
  values: string[],
  additions: string[],
  enabled: boolean,
): string[] {
  const next = new Set(values);

  for (const value of additions) {
    if (enabled) {
      next.add(value);
    } else {
      next.delete(value);
    }
  }

  return [...next];
}
