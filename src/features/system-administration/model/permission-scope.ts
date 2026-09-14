import type {
  AdminPermissionGroup,
  AdminUser,
  PermissionCatalogGroup,
} from "@/features/system-administration/model/admin-user.types";
import type { InitialPermissionAssignmentPlan } from "@/features/system-administration/model/initial-permission-assignment";
import {
  getPermissionParentMaps,
  PERMISSION_OPERATION_ACTIONS,
  type PermissionOperationPlan,
} from "@/features/system-administration/model/permission-operation-plan";
import { getPermissionGroupDisplayLabel } from "@/features/system-administration/model/system-access-presentation";

export type ScopedPermissionRequirement = {
  action: string;
  groupId: string;
  groupName: string;
};

function actionNames(group: AdminPermissionGroup | undefined): Set<string> {
  const names = new Set<string>();

  if (!group) return names;

  for (const module of group.modules) {
    for (const action of module.actions) {
      names.add(action.name.trim().toUpperCase());
    }
  }

  return names;
}

function groupNameMap(catalog: PermissionCatalogGroup[]): Map<string, string> {
  const names = new Map<string, string>();

  for (const group of catalog) {
    names.set(group.id, group.name);
  }

  return names;
}

function requirementKey(requirement: ScopedPermissionRequirement): string {
  return `${requirement.action}:${requirement.groupId}`;
}

function uniqueRequirements(
  requirements: ScopedPermissionRequirement[],
): ScopedPermissionRequirement[] {
  const seen = new Set<string>();
  const unique: ScopedPermissionRequirement[] = [];

  for (const requirement of requirements) {
    const key = requirementKey(requirement);
    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(requirement);
  }

  return unique;
}

function makeRequirement(
  action: string,
  groupId: string | undefined,
  names: Map<string, string>,
): ScopedPermissionRequirement | null {
  if (!groupId) return null;

  return {
    action,
    groupId,
    groupName: names.get(groupId) ?? groupId,
  };
}

function pushRequirement(
  target: ScopedPermissionRequirement[],
  action: string,
  groupId: string | undefined,
  names: Map<string, string>,
) {
  const requirement = makeRequirement(action, groupId, names);
  if (requirement) target.push(requirement);
}

function actorScope(actor: AdminUser | undefined): Map<string, Set<string>> {
  const scope = new Map<string, Set<string>>();

  if (!actor) return scope;

  for (const group of actor.permissionGroups) {
    scope.set(group.id, actionNames(group));
  }

  return scope;
}

export function actorHasScopedAction(
  actor: AdminUser | undefined,
  groupId: string,
  actionName: string,
): boolean {
  if (!actor) return false;
  if (actor.permissions.includes("SUPER_ADMIN")) return true;

  return actorScope(actor).get(groupId)?.has(actionName.trim().toUpperCase()) ?? false;
}

function missingRequirements(
  requirements: ScopedPermissionRequirement[],
  actor: AdminUser | undefined,
): ScopedPermissionRequirement[] {
  if (!actor) return requirements;
  if (actor.permissions.includes("SUPER_ADMIN")) return [];

  const scope = actorScope(actor);
  const missing: ScopedPermissionRequirement[] = [];

  for (const requirement of requirements) {
    if (!scope.get(requirement.groupId)?.has(requirement.action)) {
      missing.push(requirement);
    }
  }

  return missing;
}

export function requirementsForPermissionPlan(
  plan: PermissionOperationPlan,
  catalog: PermissionCatalogGroup[],
): ScopedPermissionRequirement[] {
  const maps = getPermissionParentMaps(catalog);
  const names = groupNameMap(catalog);
  const requirements: ScopedPermissionRequirement[] = [];

  for (const groupId of plan.groupsToAdd) {
    pushRequirement(requirements, PERMISSION_OPERATION_ACTIONS.groupsToAdd, groupId, names);
  }
  for (const groupId of plan.groupsToRemove) {
    pushRequirement(requirements, PERMISSION_OPERATION_ACTIONS.groupsToRemove, groupId, names);
  }
  for (const moduleId of plan.modulesToAdd) {
    pushRequirement(
      requirements,
      PERMISSION_OPERATION_ACTIONS.modulesToAdd,
      maps.moduleToGroup.get(moduleId),
      names,
    );
  }
  for (const moduleId of plan.modulesToRemove) {
    pushRequirement(
      requirements,
      PERMISSION_OPERATION_ACTIONS.modulesToRemove,
      maps.moduleToGroup.get(moduleId),
      names,
    );
  }
  for (const actionId of plan.actionsToAdd) {
    pushRequirement(
      requirements,
      PERMISSION_OPERATION_ACTIONS.actionsToAdd,
      maps.actionToGroup.get(actionId),
      names,
    );
  }
  for (const actionId of plan.actionsToRemove) {
    pushRequirement(
      requirements,
      PERMISSION_OPERATION_ACTIONS.actionsToRemove,
      maps.actionToGroup.get(actionId),
      names,
    );
  }

  return uniqueRequirements(requirements);
}

export function missingScopedRequirementsForPermissionPlan(
  plan: PermissionOperationPlan,
  catalog: PermissionCatalogGroup[],
  actor: AdminUser | undefined,
): ScopedPermissionRequirement[] {
  return missingRequirements(requirementsForPermissionPlan(plan, catalog), actor);
}

export function requirementsForInitialPermissionPlan(
  plan: InitialPermissionAssignmentPlan,
  catalog: PermissionCatalogGroup[],
): ScopedPermissionRequirement[] {
  const maps = getPermissionParentMaps(catalog);
  const names = groupNameMap(catalog);
  const requirements: ScopedPermissionRequirement[] = [];

  pushRequirement(requirements, "CREAR_USUARIO", plan.primaryGroupId, names);

  const bulkGroupIds = new Set<string>();

  if (plan.bulkRequest.grupo_id) {
    bulkGroupIds.add(plan.bulkRequest.grupo_id);
  } else {
    for (const moduleId of plan.bulkRequest.modulo_ids) {
      const groupId = maps.moduleToGroup.get(moduleId);
      if (groupId) bulkGroupIds.add(groupId);
    }

    for (const actionId of plan.bulkRequest.accion_ids) {
      const groupId = maps.actionToGroup.get(actionId);
      if (groupId) bulkGroupIds.add(groupId);
    }
  }

  for (const groupId of bulkGroupIds) {
    pushRequirement(requirements, "ASIGNAR_ACCIONES_USUARIO", groupId, names);
  }

  for (const groupId of plan.additionalGroupIds) {
    pushRequirement(requirements, "ASIGNAR_GRUPOS_USUARIO", groupId, names);
  }

  return uniqueRequirements(requirements);
}

export function missingScopedRequirementsForInitialPermissionPlan(
  plan: InitialPermissionAssignmentPlan,
  catalog: PermissionCatalogGroup[],
  actor: AdminUser | undefined,
): ScopedPermissionRequirement[] {
  return missingRequirements(requirementsForInitialPermissionPlan(plan, catalog), actor);
}

export function formatScopedPermissionRequirement(
  requirement: ScopedPermissionRequirement,
): string {
  return `${requirement.action} en ${getPermissionGroupDisplayLabel(requirement.groupName)}`;
}
