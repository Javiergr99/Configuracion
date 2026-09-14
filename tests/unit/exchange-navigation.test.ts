import { describe, expect, it } from "vitest";

import {
  cleanExchangeNavigationParameters,
  readExchangeNavigationRequest,
} from "@/features/auth/services/exchange-navigation";

describe("exchange navigation — contrato Configuración", () => {
  it("acepta el código únicamente en /app/dashboard", () => {
    const request = readExchangeNavigationRequest(
      new URL("http://127.0.0.1:5180/app/dashboard?code=one-use&persistence=persistent"),
    );

    expect(request).toEqual({
      code: "one-use",
      persistence: "persistent",
    });
  });

  it.each(["/app/perfiles", "/app/usuarios", "/app/permisos", "/app/apariencia"])(
    "rechaza el intercambio desde la ruta interna %s",
    (pathname) => {
      expect(() =>
        readExchangeNavigationRequest(new URL(`http://127.0.0.1:5180${pathname}?code=one-use`)),
      ).toThrow(/ruta de entrada autorizada/i);
    },
  );

  it("rechaza parámetros adicionales y fragmentos", () => {
    expect(() =>
      readExchangeNavigationRequest(
        new URL("http://127.0.0.1:5180/app/dashboard?code=one-use&next=/app/usuarios"),
      ),
    ).toThrow(/parámetros/i);

    expect(() =>
      readExchangeNavigationRequest(
        new URL("http://127.0.0.1:5180/app/dashboard?code=one-use#detalle"),
      ),
    ).toThrow(/fragmentos/i);
  });

  it("limpia el código y la preferencia de sesión", () => {
    expect(
      cleanExchangeNavigationParameters(
        new URL("http://127.0.0.1:5180/app/dashboard?code=one-use&persistence=session"),
      ),
    ).toBe("http://127.0.0.1:5180/app/dashboard");
  });
});
