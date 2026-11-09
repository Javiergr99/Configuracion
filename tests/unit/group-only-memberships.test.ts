import { describe, expect, it } from "vitest";
import type {
  PermissionCatalogGroup,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";
import {
  groupOnlyMemberships,
  removeGroupFromSelection,
} from "@/features/system-administration/model/group-only-memberships";

const catalog: PermissionCatalogGroup[] = [
  {
    id: "agenda", name: "SEMAFORO", assignable: true,
    modules: [{
      id: "agenda-dashboard", name: "DASHBOARD", assignable: true,
      actions: [{ id: "agenda-view", name: "VER_DASHBOARD", assignable: true }],
    }],
  },
  {
    id: "cronos", name: "CRONOS", assignable: true,
    modules: [{
      id: "cronos-module", name: "JORNADA", assignable: true,
      actions: [{ id: "cronos-view", name: "VER_JORNADA", assignable: true }],
    }],
  },
];

function selection(
  groupIds: string[], moduleIds: string[] = [], actionIds: string[] = [],
): PermissionSelection {
  return { groupIds, moduleIds, actionIds };
}

describe("prevención de grupos asignados sin permisos individuales", () => {
  it("detecta membresías reales sin módulos ni acciones", () => {
    expect(groupOnlyMemberships(catalog, selection(["agenda", "cronos"]))
      .map((group) => group.name)).toEqual(["SEMAFORO", "CRONOS"]);
  });

  it("no marca grupos con módulos seleccionados", () => {
    expect(groupOnlyMemberships(catalog, selection(["agenda"], ["agenda-dashboard"]))).toEqual([]);
  });

  it("no marca grupos con una acción seleccionada", () => {
    expect(groupOnlyMemberships(catalog, selection(["agenda"], [], ["agenda-view"]))).toEqual([]);
  });

  it("no propone retirar grupos no asignados", () => {
    expect(groupOnlyMemberships(catalog, selection(["cronos"], ["cronos-module"]))).toEqual([]);
  });

  it("retira solo el grupo elegido y sus descendientes de la selección pendiente", () => {
    const original = selection(
      ["agenda", "cronos"],
      ["agenda-dashboard", "cronos-module"],
      ["agenda-view", "cronos-view"],
    );
    const agenda = catalog.find((group) => group.id === "agenda");

    if (!agenda) {
      throw new Error("Falta SEMAFORO en el catálogo de prueba");
    }

    const next = removeGroupFromSelection(original, agenda);
    expect(next).toEqual(selection(["cronos"], ["cronos-module"], ["cronos-view"]));
    expect(original.groupIds).toEqual(["agenda", "cronos"]);
  });

  it("no quita una membresía sin acción del estado original por detectar el aviso", () => {
    const original = selection(["agenda"]);
    expect(groupOnlyMemberships(catalog, original)).toHaveLength(1);
    expect(original.groupIds).toEqual(["agenda"]);
  });
});
