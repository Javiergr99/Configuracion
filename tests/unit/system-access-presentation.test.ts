import { describe, expect, it } from "vitest";

import {
  getPermissionGroupDisplayLabel,
  getPermissionGroupPresentation,
} from "@/features/system-administration/model/system-access-presentation";

describe("system access presentation", () => {
  it("presenta SEMAFORO_DGCP como acceso de Control Agenda Nacional", () => {
    expect(getPermissionGroupPresentation("SEMAFORO_DGCP")).toMatchObject({
      title: "Control Agenda Nacional",
      scope: "DGCP",
      technicalName: "SEMAFORO_DGCP",
    });
  });

  it("conserva un fallback legible para grupos futuros", () => {
    expect(getPermissionGroupPresentation("NUEVO_SISTEMA").title).toBe("Nuevo Sistema");
  });
  it("genera una etiqueta humana para filtros y detalle", () => {
    expect(getPermissionGroupDisplayLabel("SEMAFORO_DGCP")).toBe("Control Agenda Nacional — DGCP");
  });
});
