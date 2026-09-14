import { ChevronDown, LockKeyhole } from "lucide-react";
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

function SelectionCheckbox({
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

export function PermissionTreeGroup({
  group,
  expanded,
  selectedGroupIds,
  selectedModuleIds,
  selectedActionIds,
  lockedActionIds,
  onToggleExpanded,
  onToggleGroup,
  onToggleModule,
  onToggleAction,
}: {
  group: PermissionCatalogGroup;
  expanded: boolean;
  selectedGroupIds: ReadonlySet<string>;
  selectedModuleIds: ReadonlySet<string>;
  selectedActionIds: ReadonlySet<string>;
  lockedActionIds: Set<string>;
  onToggleExpanded: (groupId: string) => void;
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
}) {
  const descendants = permissionGroupDescendants(group, lockedActionIds);
  const presentation = getPermissionGroupPresentation(group.name);

  const selectedDescendants = countSelectedIds(descendants.actionIds, selectedActionIds);

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)]">
      <div className="flex items-center gap-3 bg-slate-50 px-4 py-3">
        <SelectionCheckbox
          checked={
            selectedGroupIds.has(group.id) &&
            (descendants.actionIds.length === 0 ||
              selectedDescendants === descendants.actionIds.length)
          }
          indeterminate={
            selectedDescendants > 0 && selectedDescendants < descendants.actionIds.length
          }
          disabled={!group.assignable}
          onChange={(checked) => onToggleGroup(group, checked)}
          label={`Seleccionar grupo ${presentation.title}`}
        />

        <button
          type="button"
          className="focus-ring flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
          onClick={() => onToggleExpanded(group.id)}
          aria-expanded={expanded}
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-[var(--ui-text-primary)]">
              {presentation.title}
            </span>
            <span className="mt-0.5 block truncate text-[10px] font-medium text-[var(--ui-primary)]">
              {presentation.scope ? `${presentation.scope} · ` : ""}
              {presentation.technicalName}
            </span>

            {group.description ? (
              <span className="mt-0.5 block truncate text-xs text-[var(--ui-text-secondary)]">
                {group.description}
              </span>
            ) : null}
          </span>

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {expanded ? (
        <div className="divide-y divide-[var(--ui-border)]">
          {group.modules.map((module) => (
            <PermissionTreeModule
              key={module.id}
              group={group}
              module={module}
              selectedModuleIds={selectedModuleIds}
              selectedActionIds={selectedActionIds}
              lockedActionIds={lockedActionIds}
              onToggleModule={onToggleModule}
              onToggleAction={onToggleAction}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PermissionTreeModule({
  group,
  module,
  selectedModuleIds,
  selectedActionIds,
  lockedActionIds,
  onToggleModule,
  onToggleAction,
}: {
  group: PermissionCatalogGroup;
  module: PermissionCatalogModule;
  selectedModuleIds: ReadonlySet<string>;
  selectedActionIds: ReadonlySet<string>;
  lockedActionIds: Set<string>;
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
}) {
  const actionIds = selectableActionIdsForModule(module, lockedActionIds);

  const selectedCount = countSelectedIds(actionIds, selectedActionIds);

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3">
        <SelectionCheckbox
          checked={
            selectedModuleIds.has(module.id) &&
            (actionIds.length === 0 || selectedCount === actionIds.length)
          }
          indeterminate={selectedCount > 0 && selectedCount < actionIds.length}
          disabled={!module.assignable}
          onChange={(checked) => onToggleModule(group, module, checked)}
          label={`Seleccionar módulo ${module.name}`}
        />

        <div>
          <p className="text-sm font-semibold text-[var(--ui-text-primary)]">{module.name}</p>

          {module.description ? (
            <p className="mt-0.5 text-xs text-[var(--ui-text-secondary)]">{module.description}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid gap-2 pl-7 md:grid-cols-2">
        {module.actions.map((action) => {
          const locked = lockedActionIds.has(action.id) || !action.assignable;

          return (
            <label
              key={action.id}
              className={`flex gap-3 rounded-lg border px-3 py-3 ${
                locked
                  ? "border-slate-200 bg-slate-50"
                  : "border-[var(--ui-border)] hover:bg-slate-50"
              }`}
            >
              <SelectionCheckbox
                checked={selectedActionIds.has(action.id)}
                disabled={locked}
                onChange={(checked) => onToggleAction(group, module, action, checked)}
                label={`Permiso ${action.name}`}
              />

              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ui-text-primary)]">
                  {action.name}

                  {locked ? (
                    <LockKeyhole
                      className="h-3.5 w-3.5 text-amber-500"
                      aria-label="Permiso protegido"
                    />
                  ) : null}
                </span>

                {action.description ? (
                  <span className="mt-1 block text-xs leading-5 text-[var(--ui-text-secondary)]">
                    {action.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
