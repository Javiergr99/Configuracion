import { ChevronDown, Folder, Grid2X2, LockKeyhole } from "lucide-react";
import { useCallback } from "react";

import type {
  PermissionCatalogAction,
  PermissionCatalogGroup,
  PermissionCatalogModule,
} from "@/features/system-administration/model/admin-user.types";
import { getPermissionGroupPresentation } from "@/features/system-administration/model/system-access-presentation";
import {
  permissionGroupDescendants,
  selectableActionIdsForModule,
} from "@/features/system-administration/model/permission-tree-helpers";
import { cn } from "@/shared/lib/cn";

function TreeCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const setCheckboxRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (node) {
        node.indeterminate = Boolean(indeterminate);
      }
    },
    [indeterminate],
  );

  return (
    <input
      ref={setCheckboxRef}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      aria-label={label}
      className="h-4 w-4 rounded border-slate-300 accent-[var(--ui-primary)] disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

function countSelectedIds(ids: readonly string[], selectedIds: ReadonlySet<string>): number {
  let count = 0;

  for (const id of ids) {
    if (selectedIds.has(id)) {
      count += 1;
    }
  }

  return count;
}

type CompactTreeHandlers = {
  onToggleGroup: (group: PermissionCatalogGroup, checked: boolean) => void;
  onToggleModule: (
    group: PermissionCatalogGroup,
    module: PermissionCatalogModule,
    checked: boolean,
  ) => void;
  onToggleAction: (
    group: PermissionCatalogGroup,
    module: PermissionCatalogModule,
    action: PermissionCatalogAction,
    checked: boolean,
  ) => void;
  onToggleExpandedGroup: (groupId: string) => void;
  onToggleExpandedModule: (moduleId: string) => void;
};

export function CompactPermissionTreeGroup({
  group,
  normalizedSearch,
  expandedGroups,
  expandedModules,
  selectedGroupIds,
  selectedModuleIds,
  selectedActionIds,
  lockedActionIds,
  handlers,
}: {
  group: PermissionCatalogGroup;
  normalizedSearch: string;
  expandedGroups: Set<string> | null;
  expandedModules: Set<string> | null;
  selectedGroupIds: ReadonlySet<string>;
  selectedModuleIds: ReadonlySet<string>;
  selectedActionIds: ReadonlySet<string>;
  lockedActionIds: Set<string>;
  handlers: CompactTreeHandlers;
}) {
  const descendants = permissionGroupDescendants(group, lockedActionIds);
  const presentation = getPermissionGroupPresentation(group.name);
  const selectedActions = countSelectedIds(descendants.actionIds, selectedActionIds);
  const expanded =
    Boolean(normalizedSearch) || expandedGroups === null || expandedGroups.has(group.id);

  return (
    <div>
      <div className="flex min-h-8 items-center gap-2">
        <button
          type="button"
          className="focus-ring grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-slate-100"
          onClick={() => handlers.onToggleExpandedGroup(group.id)}
          aria-label={`${expanded ? "Contraer" : "Expandir"} ${presentation.title}`}
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", !expanded && "-rotate-90")}
            aria-hidden="true"
          />
        </button>

        <TreeCheckbox
          checked={
            selectedGroupIds.has(group.id) &&
            (descendants.actionIds.length === 0 || selectedActions === descendants.actionIds.length)
          }
          indeterminate={selectedActions > 0 && selectedActions < descendants.actionIds.length}
          disabled={!group.assignable}
          onChange={(checked) => handlers.onToggleGroup(group, checked)}
          label={`Seleccionar grupo ${presentation.title}`}
        />

        <Folder className="h-4 w-4 text-slate-500" aria-hidden="true" />

        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-[var(--ui-text-primary)]">
            {presentation.title}
          </span>
          <span className="block truncate text-[10px] text-[var(--ui-text-secondary)]">
            {presentation.scope ? `${presentation.scope} · ` : ""}
            {presentation.technicalName}
          </span>
        </span>
      </div>

      {expanded ? (
        <div className="ml-8 border-l border-slate-200 pl-4">
          {group.modules.map((module) => (
            <CompactPermissionTreeModule
              key={module.id}
              group={group}
              module={module}
              normalizedSearch={normalizedSearch}
              expandedModules={expandedModules}
              selectedModuleIds={selectedModuleIds}
              selectedActionIds={selectedActionIds}
              lockedActionIds={lockedActionIds}
              handlers={handlers}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CompactPermissionTreeModule({
  group,
  module,
  normalizedSearch,
  expandedModules,
  selectedModuleIds,
  selectedActionIds,
  lockedActionIds,
  handlers,
}: {
  group: PermissionCatalogGroup;
  module: PermissionCatalogModule;
  normalizedSearch: string;
  expandedModules: Set<string> | null;
  selectedModuleIds: ReadonlySet<string>;
  selectedActionIds: ReadonlySet<string>;
  lockedActionIds: Set<string>;
  handlers: CompactTreeHandlers;
}) {
  const actionIds = selectableActionIdsForModule(module, lockedActionIds);
  const selectedActions = countSelectedIds(actionIds, selectedActionIds);
  const expanded =
    Boolean(normalizedSearch) || expandedModules === null || expandedModules.has(module.id);

  return (
    <div className="py-0.5">
      <div className="flex min-h-8 items-center gap-2">
        <button
          type="button"
          className="focus-ring grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-slate-100"
          onClick={() => handlers.onToggleExpandedModule(module.id)}
          aria-label={`${expanded ? "Contraer" : "Expandir"} ${module.name}`}
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", !expanded && "-rotate-90")}
            aria-hidden="true"
          />
        </button>

        <TreeCheckbox
          checked={
            selectedModuleIds.has(module.id) &&
            (actionIds.length === 0 || selectedActions === actionIds.length)
          }
          indeterminate={selectedActions > 0 && selectedActions < actionIds.length}
          disabled={!module.assignable}
          onChange={(checked) => handlers.onToggleModule(group, module, checked)}
          label={`Seleccionar módulo ${module.name}`}
        />

        <Grid2X2 className="h-4 w-4 text-slate-500" aria-hidden="true" />

        <span className="text-sm font-semibold text-[var(--ui-text-primary)]">{module.name}</span>
      </div>

      {expanded ? (
        <div className="ml-8 space-y-1 border-l border-slate-100 py-1 pl-4">
          {module.actions.map((action) => {
            const locked = lockedActionIds.has(action.id) || !action.assignable;

            return (
              <label
                key={action.id}
                className={cn(
                  "flex min-h-7 items-center gap-2 rounded px-1.5 py-1 text-xs",
                  locked ? "text-slate-400" : "hover:bg-slate-50",
                )}
              >
                <TreeCheckbox
                  checked={selectedActionIds.has(action.id)}
                  disabled={locked}
                  onChange={(checked) => handlers.onToggleAction(group, module, action, checked)}
                  label={`Permiso ${action.name}`}
                />

                <span className="font-medium">{action.name}</span>

                {action.description ? (
                  <span className="text-[var(--ui-text-secondary)]">{action.description}</span>
                ) : null}

                {locked ? (
                  <LockKeyhole className="ml-auto h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                ) : null}
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
