import { useMemo, useState } from "react";

import { PermissionTreeGroup } from "@/features/system-administration/components/permission-tree-group";
import type {
  PermissionCatalogAction,
  PermissionCatalogGroup,
  PermissionCatalogModule,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";
import { normalizePermissionSelection } from "@/features/system-administration/model/permission-selection";
import {
  permissionGroupDescendants,
  selectableActionIdsForModule,
  withSelectionValues,
} from "@/features/system-administration/model/permission-tree-helpers";

const EMPTY_LOCKED_ACTION_IDS = new Set<string>();

function filterPermissionCatalog(
  catalog: PermissionCatalogGroup[],
  normalizedSearch: string,
): PermissionCatalogGroup[] {
  if (!normalizedSearch) {
    return catalog;
  }

  const filteredGroups: PermissionCatalogGroup[] = [];

  for (const group of catalog) {
    const groupMatches = group.name.toLocaleLowerCase("es-MX").includes(normalizedSearch);

    const filteredModules: PermissionCatalogModule[] = [];

    for (const module of group.modules) {
      const moduleMatches = module.name.toLocaleLowerCase("es-MX").includes(normalizedSearch);

      const filteredActions: PermissionCatalogAction[] = [];

      for (const action of module.actions) {
        const actionMatches =
          groupMatches ||
          moduleMatches ||
          action.name.toLocaleLowerCase("es-MX").includes(normalizedSearch) ||
          (action.description ?? "").toLocaleLowerCase("es-MX").includes(normalizedSearch);

        if (actionMatches) {
          filteredActions.push(action);
        }
      }

      if (filteredActions.length > 0 || moduleMatches) {
        filteredModules.push({
          ...module,
          actions: filteredActions,
        });
      }
    }

    if (filteredModules.length > 0 || groupMatches) {
      filteredGroups.push({
        ...group,
        modules: filteredModules,
      });
    }
  }

  return filteredGroups;
}

function getAllGroupIds(catalog: PermissionCatalogGroup[]): Set<string> {
  const ids = new Set<string>();

  for (const group of catalog) {
    ids.add(group.id);
  }

  return ids;
}

export function PermissionTree({
  catalog,
  selection,
  onSelectionChange,
  search,
  lockedActionIds = EMPTY_LOCKED_ACTION_IDS,
}: {
  catalog: PermissionCatalogGroup[];
  selection: PermissionSelection;
  onSelectionChange: (next: PermissionSelection) => void;
  search: string;
  lockedActionIds?: Set<string>;
}) {
  const [expanded, setExpanded] = useState<Set<string> | null>(null);

  const normalizedSearch = search.trim().toLocaleLowerCase("es-MX");

  const filteredCatalog = useMemo(
    () => filterPermissionCatalog(catalog, normalizedSearch),
    [catalog, normalizedSearch],
  );

  const selectedGroupIds = useMemo(() => new Set(selection.groupIds), [selection.groupIds]);
  const selectedModuleIds = useMemo(() => new Set(selection.moduleIds), [selection.moduleIds]);
  const selectedActionIds = useMemo(() => new Set(selection.actionIds), [selection.actionIds]);

  const emit = (next: PermissionSelection) => {
    const protectedActions = selection.actionIds.filter((id) => lockedActionIds.has(id));

    onSelectionChange(
      normalizePermissionSelection(
        {
          ...next,
          actionIds: [...new Set([...next.actionIds, ...protectedActions])],
        },
        catalog,
      ),
    );
  };

  const toggleGroup = (group: PermissionCatalogGroup, checked: boolean) => {
    const descendants = permissionGroupDescendants(group, lockedActionIds);

    emit({
      groupIds: withSelectionValues(selection.groupIds, [group.id], checked),
      moduleIds: withSelectionValues(selection.moduleIds, descendants.moduleIds, checked),
      actionIds: withSelectionValues(selection.actionIds, descendants.actionIds, checked),
    });
  };

  const toggleModule = (
    group: PermissionCatalogGroup,
    module: PermissionCatalogModule,
    checked: boolean,
  ) => {
    emit({
      groupIds: withSelectionValues(
        selection.groupIds,
        [group.id],
        checked || selectedGroupIds.has(group.id),
      ),
      moduleIds: withSelectionValues(selection.moduleIds, [module.id], checked),
      actionIds: withSelectionValues(
        selection.actionIds,
        selectableActionIdsForModule(module, lockedActionIds),
        checked,
      ),
    });
  };

  const toggleAction = (
    group: PermissionCatalogGroup,
    module: PermissionCatalogModule,
    action: PermissionCatalogAction,
    checked: boolean,
  ) => {
    if (lockedActionIds.has(action.id)) {
      return;
    }

    emit({
      groupIds: withSelectionValues(
        selection.groupIds,
        [group.id],
        checked || selectedGroupIds.has(group.id),
      ),
      moduleIds: withSelectionValues(
        selection.moduleIds,
        [module.id],
        checked || selectedModuleIds.has(module.id),
      ),
      actionIds: withSelectionValues(selection.actionIds, [action.id], checked),
    });
  };

  const toggleExpandedGroup = (groupId: string) => {
    const next = expanded === null ? getAllGroupIds(catalog) : new Set(expanded);

    if (next.has(groupId)) {
      next.delete(groupId);
    } else {
      next.add(groupId);
    }

    setExpanded(next);
  };

  return (
    <div className="space-y-3">
      {filteredCatalog.map((group) => (
        <PermissionTreeGroup
          key={group.id}
          group={group}
          expanded={Boolean(normalizedSearch) || expanded === null || expanded.has(group.id)}
          selectedGroupIds={selectedGroupIds}
          selectedModuleIds={selectedModuleIds}
          selectedActionIds={selectedActionIds}
          lockedActionIds={lockedActionIds}
          onToggleExpanded={toggleExpandedGroup}
          onToggleGroup={toggleGroup}
          onToggleModule={toggleModule}
          onToggleAction={toggleAction}
        />
      ))}
    </div>
  );
}
