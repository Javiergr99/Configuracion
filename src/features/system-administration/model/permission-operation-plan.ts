import type {
  PermissionCatalogGroup,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";

export type PermissionOperationPlan = {
  groupsToAdd: string[];
  groupsToRemove: string[];
  modulesToAdd: string[];
  modulesToRemove: string[];
  actionsToAdd: string[];
  actionsToRemove: string[];
};

export const PERMISSION_OPERATION_ACTIONS = {
  groupsToAdd: "ASIGNAR_GRUPOS_USUARIO",
  groupsToRemove: "QUITAR_GRUPOS_USUARIO",
  modulesToAdd: "ASIGNAR_MODULOS_USUARIO",
  modulesToRemove: "QUITAR_MODULOS_USUARIO",
  actionsToAdd: "ASIGNAR_ACCIONES_USUARIO",
  actionsToRemove: "QUITAR_ACCIONES_USUARIO",
} as const satisfies Record<keyof PermissionOperationPlan, string>;

function difference(next: string[], previous: string[]): string[] {
  const previousSet = new Set(previous);
  const result: string[] = [];

  for (const id of new Set(next)) {
    if (!previousSet.has(id)) {
      result.push(id);
    }
  }

  return result;
}

export function getPermissionParentMaps(catalog: PermissionCatalogGroup[]) {
  const moduleToGroup = new Map<string, string>();
  const actionToModule = new Map<string, string>();
  const actionToGroup = new Map<string, string>();
  const actionName = new Map<string, string>();

  for (const group of catalog) {
    for (const module of group.modules) {
      moduleToGroup.set(module.id, group.id);

      for (const action of module.actions) {
        actionToModule.set(action.id, module.id);
        actionToGroup.set(action.id, group.id);
        actionName.set(action.id, action.name);
      }
    }
  }

  return {
    moduleToGroup,
    actionToModule,
    actionToGroup,
    actionName,
  };
}

/**
 * Construye el conjunto mínimo de operaciones compatibles con auth_service v1.0.
 *
 * Agregar una acción asegura automáticamente su módulo y grupo padre; agregar
 * un módulo asegura su grupo. Los retiros se simplifican de forma equivalente
 * para respetar las eliminaciones en cascada documentadas por backend.
 */
export function buildPermissionOperationPlan(
  original: PermissionSelection,
  next: PermissionSelection,
  catalog: PermissionCatalogGroup[],
): PermissionOperationPlan {
  const maps = getPermissionParentMaps(catalog);

  const rawActionsToAdd = difference(next.actionIds, original.actionIds);
  const rawModulesToAdd = difference(next.moduleIds, original.moduleIds);
  const rawGroupsToAdd = difference(next.groupIds, original.groupIds);

  const modulesEnsuredByActions = new Set<string>();
  const groupsEnsuredByActions = new Set<string>();
  const groupsEnsuredByModules = new Set<string>();

  for (const actionId of rawActionsToAdd) {
    const moduleId = maps.actionToModule.get(actionId);
    const groupId = maps.actionToGroup.get(actionId);

    if (moduleId) {
      modulesEnsuredByActions.add(moduleId);
    }
    if (groupId) {
      groupsEnsuredByActions.add(groupId);
    }
  }

  for (const moduleId of rawModulesToAdd) {
    const groupId = maps.moduleToGroup.get(moduleId);

    if (groupId) {
      groupsEnsuredByModules.add(groupId);
    }
  }

  const groupsToRemove = difference(original.groupIds, next.groupIds);
  const groupsToRemoveSet = new Set(groupsToRemove);

  const modulesToRemoveRaw = difference(original.moduleIds, next.moduleIds);
  const modulesToRemove: string[] = [];

  for (const moduleId of modulesToRemoveRaw) {
    const parentGroupId = maps.moduleToGroup.get(moduleId) ?? "";

    if (!groupsToRemoveSet.has(parentGroupId)) {
      modulesToRemove.push(moduleId);
    }
  }

  const modulesToRemoveSet = new Set(modulesToRemove);

  const actionsToRemoveRaw = difference(original.actionIds, next.actionIds);
  const actionsToRemove: string[] = [];

  for (const actionId of actionsToRemoveRaw) {
    const moduleId = maps.actionToModule.get(actionId) ?? "";
    const groupId = maps.actionToGroup.get(actionId) ?? "";

    if (!groupsToRemoveSet.has(groupId) && !modulesToRemoveSet.has(moduleId)) {
      actionsToRemove.push(actionId);
    }
  }

  const groupsToAdd: string[] = [];

  for (const groupId of rawGroupsToAdd) {
    if (!groupsEnsuredByActions.has(groupId) && !groupsEnsuredByModules.has(groupId)) {
      groupsToAdd.push(groupId);
    }
  }

  const modulesToAdd: string[] = [];

  for (const moduleId of rawModulesToAdd) {
    if (!modulesEnsuredByActions.has(moduleId)) {
      modulesToAdd.push(moduleId);
    }
  }

  return {
    groupsToAdd,
    groupsToRemove,
    modulesToAdd,
    modulesToRemove,
    actionsToAdd: rawActionsToAdd,
    actionsToRemove,
  };
}

export type PermissionOperationKind = keyof PermissionOperationPlan;

export type PermissionOperationStep = {
  kind: PermissionOperationKind;
  id: string;
};

/**
 * Orden de ejecución orientado a mínimo privilegio.
 *
 * Primero se retiran accesos de mayor granularidad a menor granularidad y
 * después se agregan los nuevos. Si una secuencia no atómica se interrumpe,
 * se evita dejar al usuario con privilegios nuevos además de los anteriores.
 */
export function permissionOperationSequence(
  plan: PermissionOperationPlan,
): PermissionOperationStep[] {
  const order: PermissionOperationKind[] = [
    "actionsToRemove",
    "modulesToRemove",
    "groupsToRemove",
    "groupsToAdd",
    "modulesToAdd",
    "actionsToAdd",
  ];
  const steps: PermissionOperationStep[] = [];

  for (const kind of order) {
    for (const id of plan[kind]) {
      steps.push({ kind, id });
    }
  }

  return steps;
}

export function permissionOperationCount(plan: PermissionOperationPlan): number {
  return Object.values(plan).reduce((total, ids) => total + ids.length, 0);
}

export function requiredActionsForPermissionPlan(plan: PermissionOperationPlan): string[] {
  const actions: string[] = [];

  for (const key of Object.keys(plan) as Array<keyof PermissionOperationPlan>) {
    if (plan[key].length > 0) {
      actions.push(PERMISSION_OPERATION_ACTIONS[key]);
    }
  }

  return actions;
}

export function missingActionsForPermissionPlan(
  plan: PermissionOperationPlan,
  actorPermissions: string[],
): string[] {
  if (actorPermissions.includes("SUPER_ADMIN")) {
    return [];
  }

  const actorSet = new Set(actorPermissions);
  const required = requiredActionsForPermissionPlan(plan);
  const missing: string[] = [];

  for (const action of required) {
    if (!actorSet.has(action)) {
      missing.push(action);
    }
  }

  return missing;
}
