import { useMemo, useState } from "react";

import { CompactPermissionTreeGroup } from "@/features/system-administration/components/compact-permission-tree-group";
import type {
  PermissionCatalogAction,
  PermissionCatalogGroup,
  PermissionCatalogModule,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";
import { normalizePermissionSelection } from "@/features/system-administration/model/permission-selection";
import { permissionGroupSearchText } from "@/features/system-administration/model/system-access-presentation";
import {
  permissionGroupDescendants,
  selectableActionIdsForModule,
  withSelectionValues,
} from "@/features/system-administration/model/permission-tree-helpers";

const EMPTY_LOCKED_ACTION_IDS = new Set<string>();

function matchesSearch(value: string, normalizedSearch: string): boolean {
  return value.indexOf(normalizedSearch) >= 0;
}

function filterPermissionCatalog(
  catalog: PermissionCatalogGroup[],
  normalizedSearch: string,
): PermissionCatalogGroup[] {
  if (!normalizedSearch) {
    return catalog;
  }

  const filteredGroups: PermissionCatalogGroup[] = [];

  for (const group of catalog) {
    const groupMatches = matchesSearch(
      permissionGroupSearchText(group.name, group.description),
      normalizedSearch,
    );

    const filteredModules: PermissionCatalogModule[] = [];

    for (const module of group.modules) {
      const moduleMatches = matchesSearch(module.name.toLocaleLowerCase("es-MX"), normalizedSearch);

      const filteredActions: PermissionCatalogAction[] = [];

      for (const action of module.actions) {
        const actionMatches =
          groupMatches ||
          moduleMatches ||
          matchesSearch(action.name.toLocaleLowerCase("es-MX"), normalizedSearch) ||
          matchesSearch((action.description ?? "").toLocaleLowerCase("es-MX"), normalizedSearch);

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
  return new Set(catalog.map((group) => group.id));
}

function getAllModuleIds(catalog: PermissionCatalogGroup[]): Set<string> {
  const ids = new Set<string>();

  for (const group of catalog) {
    for (const module of group.modules) {
      ids.add(module.id);
    }
  }

  return ids;
}

export function CompactPermissionTree({
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string> | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string> | null>(null);

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
    const next = expandedGroups === null ? getAllGroupIds(catalog) : new Set(expandedGroups);

    if (next.has(groupId)) {
      next.delete(groupId);
    } else {
      next.add(groupId);
    }

    setExpandedGroups(next);
  };

  const toggleExpandedModule = (moduleId: string) => {
    const next = expandedModules === null ? getAllModuleIds(catalog) : new Set(expandedModules);

    if (next.has(moduleId)) {
      next.delete(moduleId);
    } else {
      next.add(moduleId);
    }

    setExpandedModules(next);
  };

  const handlers = {
    onToggleGroup: toggleGroup,
    onToggleModule: toggleModule,
    onToggleAction: toggleAction,
    onToggleExpandedGroup: toggleExpandedGroup,
    onToggleExpandedModule: toggleExpandedModule,
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setExpandedGroups(null);
              setExpandedModules(null);
            }}
            className="font-semibold text-[var(--ui-primary)] underline underline-offset-2"
          >
            Expandir todo
          </button>

          <button
            type="button"
            onClick={() => {
              setExpandedGroups(new Set());
              setExpandedModules(new Set());
            }}
            className="font-semibold text-[var(--ui-text-secondary)] underline underline-offset-2"
          >
            Contraer todo
          </button>
        </div>

        <span className="text-[var(--ui-text-secondary)]">
          {selection.actionIds.length} seleccionado
          {selection.actionIds.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3">
        {filteredCatalog.length ? (
          <div className="space-y-1">
            {filteredCatalog.map((group) => (
              <CompactPermissionTreeGroup
                key={group.id}
                group={group}
                normalizedSearch={normalizedSearch}
                expandedGroups={expandedGroups}
                expandedModules={expandedModules}
                selectedGroupIds={selectedGroupIds}
                selectedModuleIds={selectedModuleIds}
                selectedActionIds={selectedActionIds}
                lockedActionIds={lockedActionIds}
                handlers={handlers}
              />
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-[var(--ui-text-secondary)]">
            No se encontraron permisos con ese criterio.
          </p>
        )}
      </div>
    </div>
  );
}
