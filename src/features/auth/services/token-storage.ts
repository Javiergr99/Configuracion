import type { TokenResponse } from "@/features/auth/api/auth.contracts";
import {
  sessionPersistence,
  type TokenPersistence,
} from "@/features/auth/services/session-persistence";

export type { TokenPersistence } from "@/features/auth/services/session-persistence";

let accessToken: string | null = null;

/**
 * El access token vive únicamente en memoria JavaScript. El refresh token no
 * se expone al frontend: auth_service lo mantiene en una cookie HttpOnly.
 */
export const authTokenStorage = {
  save(tokens: TokenResponse, persistence: TokenPersistence = "session") {
    accessToken = tokens.access_token;
    sessionPersistence.save(persistence);
  },

  replace(tokens: TokenResponse) {
    accessToken = tokens.access_token;
  },

  getAccessToken(): string | null {
    return accessToken;
  },

  getPersistence(): TokenPersistence {
    return sessionPersistence.get();
  },

  hasSession(): boolean {
    return Boolean(accessToken) || sessionPersistence.has();
  },

  clear() {
    accessToken = null;
    sessionPersistence.clear();
  },
};
