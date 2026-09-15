import type { UpdatePermissionsDeltaRequest } from "@/features/system-administration/api/admin-users.contracts";
import type { PermissionOperationPlan } from "@/features/system-administration/model/permission-operation-plan";

/**
 * Traduce el plan de cambios del frontend al contrato atómico publicado por auth_service.
 */
export function mapPermissionPlanToDeltaRequest(
  plan: PermissionOperationPlan,
): UpdatePermissionsDeltaRequest {
  return {
    grupo_ids_agregar: plan.groupsToAdd,
    grupo_ids_quitar: plan.groupsToRemove,
    modulo_ids_agregar: plan.modulesToAdd,
    modulo_ids_quitar: plan.modulesToRemove,
    accion_ids_agregar: plan.actionsToAdd,
    accion_ids_quitar: plan.actionsToRemove,
  };
}
