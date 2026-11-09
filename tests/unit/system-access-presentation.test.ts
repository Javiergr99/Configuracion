import { describe, expect, it } from "vitest";

import {
  getPermissionGroupDisplayLabel,
  getPermissionGroupPresentation,
} from "@/features/system-administration/model/system-access-presentation";

describe("system access presentation", () => {
  it("presenta SEMAFORO canonico como acceso de Control Agenda Nacional", () => {
    expect(getPermissionGroupPresentation("SEMAFORO")).toMatchObject({
      title: "Control Agenda Nacional",
      scope: "Administración, direcciones generales y permisos",
      technicalName: "SEMAFORO",
    });
  });

  it("conserva un fallback legible para grupos futuros", () => {
    expect(getPermissionGroupPresentation("NUEVO_SISTEMA").title).toBe("Nuevo Sistema");
  });
  it("genera una etiqueta humana para filtros y detalle", () => {
    expect(getPermissionGroupDisplayLabel("SEMAFORO")).toBe("Control Agenda Nacional — Administración, direcciones generales y permisos");
  });
});
