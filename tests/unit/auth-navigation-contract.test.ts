import { describe, expect, it } from "vitest";

import {
  buildAuthLoginUrl,
  buildConfigurationAuthReturnUrl,
} from "@/features/auth/services/auth-navigation";

describe("navegación de autenticación — Configuración", () => {
  it("usa siempre el callback único autorizado", () => {
    window.history.replaceState({}, "", "/app/usuarios?user=123");

    expect(buildConfigurationAuthReturnUrl()).toBe("http://localhost:3000/app/dashboard");

    const loginUrl = new URL(buildAuthLoginUrl());

    expect(loginUrl.searchParams.get("return_url")).toBe("http://localhost:3000/app/dashboard");
  });

  it("no propaga la ruta interna actual al login central", () => {
    window.history.replaceState({}, "", "/app/apariencia");

    const loginUrl = new URL(buildAuthLoginUrl());

    expect(loginUrl.searchParams.get("return_url")).not.toContain("/app/apariencia");
  });
});
