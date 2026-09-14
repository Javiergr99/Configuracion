import { afterEach, describe, expect, it } from "vitest";

import type { AuthenticatedUser } from "@/features/auth/api/auth.contracts";
import {
  getAccessTokenActionNames,
  sessionHasExactAction,
} from "@/features/auth/services/jwt-actions";
import { authTokenStorage } from "@/features/auth/services/token-storage";

const user: AuthenticatedUser = {
  id: "user-1",
  nombre: "Admin",
  primer_apellido: "General",
  correo_electronico: "admin@example.com",
  curp: "AURA000101HDFXXX01",
  is_2fa_enabled: true,
  intentos_login: 0,
  fecha_creacion: "2026-01-01T00:00:00Z",
  fecha_actualizacion: "2026-01-01T00:00:00Z",
  permisos: { grupos: [] },
};

function tokenWithActions(actions: string[]): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ acciones: actions })}.signature`;
}

afterEach(() => authTokenStorage.clear());

describe("JWT action claims", () => {
  it("lee las acciones concretas del access token", () => {
    authTokenStorage.save({
      access_token: tokenWithActions(["VER_BITACORA", "VER_DASHBOARD"]),
    });

    expect(getAccessTokenActionNames()).toEqual(["VER_BITACORA", "VER_DASHBOARD"]);
    expect(sessionHasExactAction(user, "VER_BITACORA")).toBe(true);
  });
});
