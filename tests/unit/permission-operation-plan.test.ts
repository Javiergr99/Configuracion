import {
  buildPermissionOperationPlan,
  missingActionsForPermissionPlan,
  permissionOperationSequence,
} from "@/features/system-administration/model/permission-operation-plan";
import type { PermissionCatalogGroup } from "@/features/system-administration/model/admin-user.types";

const catalog: PermissionCatalogGroup[] = [
  {
    id: "group-1",
    name: "MESA_AYUDA",
    assignable: true,
    modules: [
      {
        id: "module-1",
        name: "ADMINISTRACION_USUARIOS",
        assignable: true,
        actions: [{ id: "action-1", name: "VER_USUARIOS", assignable: true }],
      },
    ],
  },
];

describe("permission operation plan", () => {
  it("usa la acción como operación mínima porque backend asegura sus padres", () => {
    const plan = buildPermissionOperationPlan(
      { groupIds: [], moduleIds: [], actionIds: [] },
      { groupIds: ["group-1"], moduleIds: ["module-1"], actionIds: ["action-1"] },
      catalog,
    );

    expect(plan.groupsToAdd).toEqual([]);
    expect(plan.modulesToAdd).toEqual([]);
    expect(plan.actionsToAdd).toEqual(["action-1"]);
  });

  it("usa el retiro del grupo como operación en cascada", () => {
    const plan = buildPermissionOperationPlan(
      { groupIds: ["group-1"], moduleIds: ["module-1"], actionIds: ["action-1"] },
      { groupIds: [], moduleIds: [], actionIds: [] },
      catalog,
    );

    expect(plan.groupsToRemove).toEqual(["group-1"]);
    expect(plan.modulesToRemove).toEqual([]);
    expect(plan.actionsToRemove).toEqual([]);
  });

  it("detecta la acción administrativa faltante antes de llamar al backend", () => {
    const plan = buildPermissionOperationPlan(
      { groupIds: [], moduleIds: [], actionIds: [] },
      { groupIds: ["group-1"], moduleIds: ["module-1"], actionIds: ["action-1"] },
      catalog,
    );

    expect(missingActionsForPermissionPlan(plan, ["VER_USUARIOS"])).toEqual([
      "ASIGNAR_ACCIONES_USUARIO",
    ]);
    expect(missingActionsForPermissionPlan(plan, ["SUPER_ADMIN"])).toEqual([]);
  });
  it("ejecuta retiros antes de altas para conservar mínimo privilegio", () => {
    const sequence = permissionOperationSequence({
      groupsToAdd: ["g-new"],
      groupsToRemove: ["g-old"],
      modulesToAdd: ["m-new"],
      modulesToRemove: ["m-old"],
      actionsToAdd: ["a-new"],
      actionsToRemove: ["a-old"],
    });

    expect(sequence).toEqual([
      { kind: "actionsToRemove", id: "a-old" },
      { kind: "modulesToRemove", id: "m-old" },
      { kind: "groupsToRemove", id: "g-old" },
      { kind: "groupsToAdd", id: "g-new" },
      { kind: "modulesToAdd", id: "m-new" },
      { kind: "actionsToAdd", id: "a-new" },
    ]);
  });
});
