import { describe, expect, it } from "vitest";
import { buildPermissionOperationPlan } from "@/features/system-administration/model/permission-operation-plan";
import { mapPermissionPlanToDeltaRequest } from "@/features/system-administration/api/permission-delta.mapper";
import type { PermissionCatalogGroup } from "@/features/system-administration/model/admin-user.types";

const catalog: PermissionCatalogGroup[] = [{
  id: "mesa", name: "MESA_AYUDA", assignable: true,
  modules: [{ id: "admin-mod", name: "ADMINISTRACION_USUARIOS", assignable: true,
    actions: [{ id: "super", name: "SUPER_ADMIN", assignable: true },
      { id: "view", name: "VER_USUARIOS", assignable: true }],
  }],
}];

describe("retiro explícito de permisos sin excepción por rango", () => {
  it("construye retiro de SUPER_ADMIN (backend protege último administrador)", () => {
    const plan = buildPermissionOperationPlan(
      { groupIds: ["mesa"], moduleIds: ["admin-mod"], actionIds: ["super", "view"] },
      { groupIds: ["mesa"], moduleIds: ["admin-mod"], actionIds: ["view"] },
      catalog,
    );
    expect(plan.actionsToRemove).toEqual(["super"]);
    expect(mapPermissionPlanToDeltaRequest(plan).accion_ids_quitar).toEqual(["super"]);
  });
});
