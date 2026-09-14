import type {
  PermissionCatalogGroup,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";
import { getPermissionParentMaps } from "@/features/system-administration/model/permission-operation-plan";

export type InitialPermissionAssignmentPlan = {
  primaryGroupId: string;
  bulkRequest: {
    grupo_id: string | null;
    modulo_ids: string[];
    accion_ids: string[];
  };
  additionalGroupIds: string[];
};

export function buildInitialPermissionAssignmentPlan(
  selection: PermissionSelection,
  catalog: PermissionCatalogGroup[],
): InitialPermissionAssignmentPlan {
  const groupIds = [...new Set(selection.groupIds)];
  const moduleIds = [...new Set(selection.moduleIds)];
  const actionIds = [...new Set(selection.actionIds)];
  const primaryGroupId = groupIds[0];

  if (!primaryGroupId) {
    throw new Error("Selecciona al menos un grupo o sistema.");
  }

  const maps = getPermissionParentMaps(catalog);
  const inferredGroupIds = new Set<string>();

  for (const moduleId of moduleIds) {
    const groupId = maps.moduleToGroup.get(moduleId);
    if (groupId) inferredGroupIds.add(groupId);
  }

  for (const actionId of actionIds) {
    const groupId = maps.actionToGroup.get(actionId);
    if (groupId) inferredGroupIds.add(groupId);
  }

  const hasFunctionalPermissions = moduleIds.length > 0 || actionIds.length > 0;
  const bulkGroupId = hasFunctionalPermissions && groupIds.length > 1 ? null : primaryGroupId;

  const additionalGroupIds = groupIds.filter(
    (groupId) => groupId !== primaryGroupId && !inferredGroupIds.has(groupId),
  );

  return {
    primaryGroupId,
    bulkRequest: {
      grupo_id: bulkGroupId,
      modulo_ids: moduleIds,
      accion_ids: actionIds,
    },
    additionalGroupIds,
  };
}

export function requiredActionsForInitialPermissionPlan(
  plan: InitialPermissionAssignmentPlan,
): string[] {
  const actions = ["ASIGNAR_ACCIONES_USUARIO"];

  if (plan.additionalGroupIds.length > 0) {
    actions.push("ASIGNAR_GRUPOS_USUARIO");
  }

  return actions;
}

export function missingActionsForInitialPermissionPlan(
  plan: InitialPermissionAssignmentPlan,
  actorPermissions: readonly string[],
): string[] {
  const normalized = new Set(actorPermissions.map((action) => action.trim().toUpperCase()));
  if (normalized.has("SUPER_ADMIN")) return [];

  return requiredActionsForInitialPermissionPlan(plan).filter((action) => !normalized.has(action));
}
