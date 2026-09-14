import type { ApiErrorPayload, TokenResponse } from "@/features/auth/api/auth.contracts";
import { authTokenStorage } from "@/features/auth/services/token-storage";

const API_URL: string = (() => {
  const value = import.meta.env.VITE_API_URL;

  if (!value) {
    throw new Error("VITE_API_URL es obligatoria para inicializar el cliente de autenticación.");
  }

  return value;
})();

export const AUTH_SESSION_EXPIRED_EVENT = "configuracion:session-expired";

export class AuthApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(status: number, payload: ApiErrorPayload | null) {
    const nested =
      payload?.detail && typeof payload.detail === "object" && !Array.isArray(payload.detail)
        ? payload.detail
        : null;

    const detail =
      typeof payload?.detail === "string"
        ? payload.detail
        : (nested?.detail ?? "No fue posible completar la solicitud.");

    super(detail);
    this.name = "AuthApiError";
    this.status = status;
    this.code = payload?.code ?? nested?.code ?? `HTTP_${status}`;
    this.fieldErrors = payload?.field_errors;
  }
}

type AuthRequestOptions = {
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
};

let refreshPromise: Promise<TokenResponse> | null = null;

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;

  return (await response.json().catch(() => null)) as T;
}

async function parseApiError(response: Response): Promise<ApiErrorPayload | null> {
  return parseResponse<ApiErrorPayload | null>(response);
}

function rememberSessionHeader(): HeadersInit {
  return {
    "X-Remember-Session": authTokenStorage.getPersistence() === "persistent" ? "true" : "false",
  };
}

async function requestRefreshSession(includeRememberPreference: boolean): Promise<TokenResponse> {
  if (!refreshPromise) {
    const headers = new Headers({
      Accept: "application/json",
    });

    if (includeRememberPreference) {
      const rememberHeaders = new Headers(rememberSessionHeader());

      rememberHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorPayload = await parseApiError(response);
          throw new AuthApiError(response.status, errorPayload);
        }

        return await parseResponse<TokenResponse>(response);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  const activeRefresh = refreshPromise;

  if (activeRefresh === null) {
    throw new Error("No fue posible iniciar la renovación de sesión.");
  }

  return activeRefresh;
}

/**
 * Renueva una sesión ya conocida por este frontend.
 */
export async function refreshAuthSession(): Promise<TokenResponse> {
  if (!authTokenStorage.hasSession()) {
    throw new Error("No existe una sesión renovable.");
  }

  const payload = await requestRefreshSession(true);
  authTokenStorage.replace(payload);

  return payload;
}

/**
 * Intenta recuperar una sesión central únicamente mediante la cookie HttpOnly.
 *
 * Este intento es necesario cuando el usuario llega por primera vez a
 * Configuración pero ya mantiene una sesión válida en auth_service. Al no
 * poder leer la cookie desde JavaScript, un 401 simplemente significa que el
 * usuario deberá pasar por login_admin.
 */
export async function recoverCentralAuthSession(): Promise<TokenResponse> {
  return await requestRefreshSession(false);
}

export async function authRequest<T>(
  path: string,
  init: RequestInit = {},
  options: AuthRequestOptions = {},
): Promise<T> {
  const { authenticated = true, retryOnUnauthorized = true } = options;

  const accessToken = authTokenStorage.getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (
    response.status === 401 &&
    authenticated &&
    retryOnUnauthorized &&
    authTokenStorage.hasSession()
  ) {
    try {
      await refreshAuthSession();
      return await authRequest<T>(path, init, {
        authenticated,
        retryOnUnauthorized: false,
      });
    } catch {
      authTokenStorage.clear();
      window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
    }
  }

  if (!response.ok) {
    const errorPayload = await parseApiError(response);
    throw new AuthApiError(response.status, errorPayload);
  }

  return await parseResponse<T>(response);
}
