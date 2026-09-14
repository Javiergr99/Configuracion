import { isAuthorizedAuthEntryPath } from "@/features/auth/config/auth-entry-points";
import type { TokenPersistence } from "@/features/auth/services/token-storage";

const AUTH_QUERY_PARAMETERS = new Set(["code", "persistence"]);

export type ExchangeNavigationRequest = {
  code: string;
  persistence: TokenPersistence;
};

export class ExchangeNavigationError extends Error {
  readonly code:
    | "UNAUTHORIZED_ENTRY_PATH"
    | "INVALID_EXCHANGE_URL"
    | "INVALID_EXCHANGE_CODE"
    | "INVALID_PERSISTENCE";

  constructor(code: ExchangeNavigationError["code"], message: string) {
    super(message);
    this.name = "ExchangeNavigationError";
    this.code = code;
  }
}

function readPersistence(url: URL): TokenPersistence {
  const values = url.searchParams.getAll("persistence");
  if (values.length > 1) {
    throw new ExchangeNavigationError(
      "INVALID_PERSISTENCE",
      "La redirección contiene más de una preferencia de sesión.",
    );
  }

  const value = values[0];
  if (value === undefined || value === "session") return "session";
  if (value === "persistent") return "persistent";

  throw new ExchangeNavigationError(
    "INVALID_PERSISTENCE",
    "La preferencia de sesión recibida no es válida.",
  );
}

function assertExpectedQueryParameters(url: URL) {
  for (const parameter of url.searchParams.keys()) {
    if (!AUTH_QUERY_PARAMETERS.has(parameter)) {
      throw new ExchangeNavigationError(
        "INVALID_EXCHANGE_URL",
        "La redirección contiene parámetros que no pertenecen al flujo de autenticación.",
      );
    }
  }

  if (url.hash) {
    throw new ExchangeNavigationError(
      "INVALID_EXCHANGE_URL",
      "La redirección de autenticación no puede contener fragmentos.",
    );
  }
}

export function readExchangeNavigationRequest(url: URL): ExchangeNavigationRequest | null {
  const codeValues = url.searchParams.getAll("code");
  if (codeValues.length === 0) {
    if (url.searchParams.has("persistence")) {
      throw new ExchangeNavigationError(
        "INVALID_EXCHANGE_URL",
        "La preferencia de sesión no puede recibirse sin un código temporal.",
      );
    }
    return null;
  }

  if (!isAuthorizedAuthEntryPath(url.pathname)) {
    throw new ExchangeNavigationError(
      "UNAUTHORIZED_ENTRY_PATH",
      "El código temporal solo puede intercambiarse desde una ruta de entrada autorizada.",
    );
  }

  assertExpectedQueryParameters(url);

  const code = codeValues[0]?.trim();
  if (codeValues.length !== 1 || !code) {
    throw new ExchangeNavigationError(
      "INVALID_EXCHANGE_CODE",
      "El código temporal recibido no es válido.",
    );
  }

  return {
    code,
    persistence: readPersistence(url),
  };
}

export function cleanExchangeNavigationParameters(url: URL): string {
  const cleanUrl = new URL(url.toString());
  cleanUrl.searchParams.delete("code");
  cleanUrl.searchParams.delete("persistence");
  cleanUrl.hash = "";
  return cleanUrl.toString();
}
