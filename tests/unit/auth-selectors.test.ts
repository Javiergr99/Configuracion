import { describe, expect, it } from "vitest";

import type { AuthenticatedUser } from "@/features/auth/api/auth.contracts";
import {
  getUserActionNames,
  isSuperAdmin,
  userHasAction,
  userHasExactAction,
} from "@/features/auth/model/auth.selectors";

const user = {
  id: "user-1",
  nombre: "Administrador",
  primer_apellido: "General",
  correo_electronico: "admin@example.com",
  curp: "AURA000101HDFXXX01",
  is_2fa_enabled: true,
  intentos_login: 0,
  fecha_creacion: "2026-01-01T00:00:00Z",
  fecha_actualizacion: "2026-01-01T00:00:00Z",
  permisos: {
    grupos: [
      {
        id: "group-1",
        nombre: "MESA_AYUDA",
        modulos: [
          {
            id: "module-1",
            nombre: "ADMINISTRACION_USUARIOS",
            acciones: [
              { id: "action-1", nombre: "VER_USUARIOS" },
              { id: "action-2", nombre: "SUPER_ADMIN" },
            ],
          },
        ],
      },
    ],
  },
} satisfies AuthenticatedUser;

describe("auth selectors", () => {
  it("extrae acciones desde permisos.grupos.modulos.acciones", () => {
    expect(getUserActionNames(user)).toEqual(["VER_USUARIOS", "SUPER_ADMIN"]);
  });

  it("reconoce SUPER_ADMIN y concede las validaciones visuales administrativas", () => {
    expect(isSuperAdmin(user)).toBe(true);
    expect(userHasAction(user, "ADMINISTRAR_USUARIOS")).toBe(true);
  });

  it("no usa SUPER_ADMIN como bypass para acciones exactas de API Mesa de Ayuda", () => {
    expect(userHasExactAction(user, "VER_BITACORA")).toBe(false);
    expect(userHasExactAction(user, "SUPER_ADMIN")).toBe(true);
  });
});
