import { describe, expect, it } from "vitest";

import type { PermissionCatalogGroup } from "@/features/system-administration/model/admin-user.types";
import {
  unifiedSemaforoCatalogForDisplay,
  unifiedSemaforoCatalogForNewUsers,
} from "@/features/system-administration/model/unified-semaforo-catalog";
import { buildPermissionOperationPlan } from "@/features/system-administration/model/permission-operation-plan";

function group(name: string, id: string): PermissionCatalogGroup {
  return {
    id,
    name,
    assignable: true,
    modules: [
      {
        id: `${id}-module`,
        name: "MODULO",
        assignable: true,
        actions: [
          {
            id: `${id}-action`,
            name: "VER_ACCIONES",
            assignable: true,
          },
        ],
      },
    ],
  };
}

const catalog = [
  group("SEMAFORO_DGCP", "legacy"),
  group("SEMAFORO_ADMIN", "legacy-admin"),
  group("SEMAFORO", "canonical"),
  group("MESA_AYUDA", "mesa"),
];

describe("catalogo canonico SEMAFORO", () => {
  it("oculta los grupos heredados en el catalogo visual", () => {
    expect(
      unifiedSemaforoCatalogForDisplay(catalog).map((g) => g.name),
    ).toEqual(["SEMAFORO", "MESA_AYUDA"]);
  });

  it("impide seleccionar grupos heredados para nuevas cuentas", () => {
    expect(
      unifiedSemaforoCatalogForNewUsers(catalog).map((g) => g.name),
    ).toEqual(["SEMAFORO", "MESA_AYUDA"]);
  });

  it("conserva el catalogo original sin mutaciones", () => {
    unifiedSemaforoCatalogForDisplay(catalog);
    expect(catalog).toHaveLength(4);
  });

  it("no oculta datos si el grupo canonico falta", () => {
    const oldOnly = [group("SEMAFORO_DGCP", "legacy")];
    expect(unifiedSemaforoCatalogForDisplay(oldOnly)).toBe(oldOnly);
  });

  it("no elimina permisos heredados al editar el canonico", () => {
    const original = {
      groupIds: ["legacy", "canonical"],
      moduleIds: ["legacy-module", "canonical-module"],
      actionIds: ["legacy-action", "canonical-action"],
    };

    const next = {
      ...original,
      actionIds: ["legacy-action"],
    };

    const plan = buildPermissionOperationPlan(original, next, catalog);

    expect(plan.groupsToRemove).toEqual([]);
    expect(plan.modulesToRemove).toEqual([]);
    expect(plan.actionsToRemove).toEqual(["canonical-action"]);
  });
});
