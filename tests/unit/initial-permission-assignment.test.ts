import {
  buildInitialPermissionAssignmentPlan,
  missingActionsForInitialPermissionPlan,
} from "@/features/system-administration/model/initial-permission-assignment";
import type { PermissionCatalogGroup } from "@/features/system-administration/model/admin-user.types";

const catalog: PermissionCatalogGroup[] = [
  {
    id: "mesa",
    name: "MESA_AYUDA",
    assignable: true,
    modules: [
      {
        id: "mesa-module",
        name: "ATENCIONES",
        assignable: true,
        actions: [{ id: "mesa-action", name: "VER_BITACORA", assignable: true }],
      },
    ],
  },
  {
    id: "agenda",
    name: "SEMAFORO_DGCP",
    assignable: true,
    modules: [
      {
        id: "agenda-module",
        name: "GESTION_ACCIONES",
        assignable: true,
        actions: [{ id: "agenda-action", name: "VER_ACCIONES_SEMAFORO", assignable: true }],
      },
    ],
  },
  { id: "directorio", name: "DIRECTORIO_PROCURADORES", assignable: true, modules: [] },
];

describe("initial permission assignment", () => {
  it("usa grupo_id del grupo único y conserva sus permisos", () => {
    expect(
      buildInitialPermissionAssignmentPlan(
        { groupIds: ["mesa"], moduleIds: ["mesa-module"], actionIds: ["mesa-action"] },
        catalog,
      ),
    ).toEqual({
      primaryGroupId: "mesa",
      bulkRequest: {
        grupo_id: "mesa",
        modulo_ids: ["mesa-module"],
        accion_ids: ["mesa-action"],
      },
      additionalGroupIds: [],
    });
  });

  it("usa grupo_id null cuando módulos y acciones pertenecen a varios grupos", () => {
    const plan = buildInitialPermissionAssignmentPlan(
      {
        groupIds: ["mesa", "agenda"],
        moduleIds: ["mesa-module", "agenda-module"],
        actionIds: ["mesa-action", "agenda-action"],
      },
      catalog,
    );

    expect(plan.bulkRequest.grupo_id).toBeNull();
    expect(plan.additionalGroupIds).toEqual([]);
  });

  it("separa grupos adicionales sin módulos o acciones para asignarlos por endpoint de grupo", () => {
    const plan = buildInitialPermissionAssignmentPlan(
      {
        groupIds: ["mesa", "agenda", "directorio"],
        moduleIds: ["agenda-module"],
        actionIds: ["agenda-action"],
      },
      catalog,
    );

    expect(plan.bulkRequest.grupo_id).toBeNull();
    expect(plan.additionalGroupIds).toEqual(["directorio"]);
  });

  it("permite acceso inicial únicamente por grupos", () => {
    const plan = buildInitialPermissionAssignmentPlan(
      { groupIds: ["mesa", "directorio"], moduleIds: [], actionIds: [] },
      catalog,
    );

    expect(plan.bulkRequest).toEqual({ grupo_id: "mesa", modulo_ids: [], accion_ids: [] });
    expect(plan.additionalGroupIds).toEqual(["directorio"]);
  });

  it("exige ASIGNAR_GRUPOS cuando existen grupos adicionales no inferibles", () => {
    const plan = buildInitialPermissionAssignmentPlan(
      { groupIds: ["mesa", "directorio"], moduleIds: [], actionIds: [] },
      catalog,
    );

    expect(missingActionsForInitialPermissionPlan(plan, ["ASIGNAR_ACCIONES_USUARIO"])).toEqual([
      "ASIGNAR_GRUPOS_USUARIO",
    ]);
    expect(missingActionsForInitialPermissionPlan(plan, ["SUPER_ADMIN"])).toEqual([]);
  });
});
