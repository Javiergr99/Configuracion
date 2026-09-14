import { describe, expect, it } from "vitest";

import type {
  AdminUser,
  PermissionCatalogGroup,
} from "@/features/system-administration/model/admin-user.types";
import { buildInitialPermissionAssignmentPlan } from "@/features/system-administration/model/initial-permission-assignment";
import { buildPermissionOperationPlan } from "@/features/system-administration/model/permission-operation-plan";
import {
  missingScopedRequirementsForInitialPermissionPlan,
  missingScopedRequirementsForPermissionPlan,
} from "@/features/system-administration/model/permission-scope";

const catalog: PermissionCatalogGroup[] = [
  {
    id: "g-mesa",
    name: "MESA_AYUDA",
    assignable: true,
    modules: [
      {
        id: "m-mesa",
        name: "ADMINISTRACION_USUARIOS",
        assignable: true,
        actions: [{ id: "a-mesa", name: "VER_USUARIOS", assignable: true }],
      },
    ],
  },
  {
    id: "g-agenda",
    name: "SEMAFORO_DGCP",
    assignable: true,
    modules: [
      {
        id: "m-agenda",
        name: "GESTION_ACCIONES",
        assignable: true,
        actions: [{ id: "a-agenda", name: "VER_ACCIONES_SEMAFORO", assignable: true }],
      },
    ],
  },
];

function actorWithGroupActions(groupActions: Record<string, string[]>): AdminUser {
  return {
    id: "actor",
    username: "actor",
    fullName: "Actor Admin",
    firstName: "Actor",
    firstSurname: "Admin",
    curp: "AAAA000000HDFXXX00",
    email: "actor@example.test",
    instanceId: 1,
    instance: "SNDIF",
    entityId: 9,
    entity: "Ciudad de México",
    groups: [],
    statusId: 1,
    status: "ACTIVO",
    permissionGroups: Object.entries(groupActions).map(([groupId, actions]) => ({
      id: groupId,
      name: groupId === "g-agenda" ? "SEMAFORO_DGCP" : "MESA_AYUDA",
      modules: [
        {
          id: `admin-${groupId}`,
          name: "ADMINISTRACION_USUARIOS",
          actions: actions.map((name) => ({ id: `${groupId}-${name}`, name })),
        },
      ],
    })),
    permissions: Object.values(groupActions).flat(),
  };
}

describe("permission-scope", () => {
  it("valida la acción administrativa dentro del grupo objetivo y no de forma global", () => {
    const actor = actorWithGroupActions({
      "g-mesa": ["ASIGNAR_ACCIONES_USUARIO"],
      "g-agenda": ["VER_USUARIOS"],
    });
    const plan = buildPermissionOperationPlan(
      { groupIds: [], moduleIds: [], actionIds: [] },
      { groupIds: ["g-agenda"], moduleIds: ["m-agenda"], actionIds: ["a-agenda"] },
      catalog,
    );

    expect(missingScopedRequirementsForPermissionPlan(plan, catalog, actor)).toEqual([
      expect.objectContaining({
        action: "ASIGNAR_ACCIONES_USUARIO",
        groupId: "g-agenda",
      }),
    ]);
  });

  it("permite a SUPER_ADMIN operar sobre cualquier grupo", () => {
    const actor = actorWithGroupActions({ "g-mesa": ["SUPER_ADMIN"] });
    actor.permissions = ["SUPER_ADMIN"];
    const plan = buildPermissionOperationPlan(
      { groupIds: [], moduleIds: [], actionIds: [] },
      { groupIds: ["g-agenda"], moduleIds: ["m-agenda"], actionIds: ["a-agenda"] },
      catalog,
    );

    expect(missingScopedRequirementsForPermissionPlan(plan, catalog, actor)).toEqual([]);
  });

  it("prevalida CREAR_USUARIO y asignación inicial por cada grupo involucrado", () => {
    const actor = actorWithGroupActions({
      "g-mesa": ["CREAR_USUARIO", "ASIGNAR_ACCIONES_USUARIO"],
      "g-agenda": ["CREAR_USUARIO"],
    });
    const plan = buildInitialPermissionAssignmentPlan(
      {
        groupIds: ["g-mesa", "g-agenda"],
        moduleIds: ["m-mesa", "m-agenda"],
        actionIds: ["a-mesa", "a-agenda"],
      },
      catalog,
    );

    expect(missingScopedRequirementsForInitialPermissionPlan(plan, catalog, actor)).toEqual([
      expect.objectContaining({
        action: "ASIGNAR_ACCIONES_USUARIO",
        groupId: "g-agenda",
      }),
    ]);
  });
});
