import { describe, expect, it } from "vitest";

import { mapPermissionPlanToDeltaRequest } from "@/features/system-administration/api/permission-delta.mapper";

describe("permission delta mapper", () => {
  it("traduce las seis colecciones del plan al contrato atómico de auth_service", () => {
    expect(
      mapPermissionPlanToDeltaRequest({
        groupsToAdd: ["g-add"],
        groupsToRemove: ["g-remove"],
        modulesToAdd: ["m-add"],
        modulesToRemove: ["m-remove"],
        actionsToAdd: ["a-add"],
        actionsToRemove: ["a-remove"],
      }),
    ).toEqual({
      grupo_ids_agregar: ["g-add"],
      grupo_ids_quitar: ["g-remove"],
      modulo_ids_agregar: ["m-add"],
      modulo_ids_quitar: ["m-remove"],
      accion_ids_agregar: ["a-add"],
      accion_ids_quitar: ["a-remove"],
    });
  });
});
