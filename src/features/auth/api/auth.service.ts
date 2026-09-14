import type {
  AuthenticatedUser,
  ExchangeCodeRequest,
  TokenResponse,
} from "@/features/auth/api/auth.contracts";
import { authRequest } from "@/features/auth/api/auth-client";
import type { TokenPersistence } from "@/features/auth/services/token-storage";

function rememberSessionHeaders(persistence: TokenPersistence): HeadersInit {
  return {
    "X-Remember-Session": persistence === "persistent" ? "true" : "false",
  };
}

export const authService = {
  exchangeCode(code: string, persistence: TokenPersistence = "session"): Promise<TokenResponse> {
    const body: ExchangeCodeRequest = { code };
    return authRequest<TokenResponse>(
      "/auth/exchange-code",
      {
        method: "POST",
        headers: rememberSessionHeaders(persistence),
        body: JSON.stringify(body),
      },
      { authenticated: false, retryOnUnauthorized: false },
    );
  },

  getCurrentUser(): Promise<AuthenticatedUser> {
    return authRequest<AuthenticatedUser>("/users/me");
  },

  async logout(): Promise<void> {
    await authRequest<unknown>(
      "/auth/logout",
      { method: "POST" },
      { authenticated: false, retryOnUnauthorized: false },
    );
  },
};
