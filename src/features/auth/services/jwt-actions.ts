import type { AuthenticatedUser } from "@/features/auth/api/auth.contracts";
import { getUserActionNames } from "@/features/auth/model/auth.selectors";
import { authTokenStorage } from "@/features/auth/services/token-storage";

type AccessTokenPayload = {
  acciones?: unknown;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return decodeURIComponent(
    Array.from(atob(padded))
      .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
}

export function getAccessTokenActionNames(): string[] {
  const token = authTokenStorage.getAccessToken();
  if (!token) return [];

  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return [];
    const payload = JSON.parse(decodeBase64Url(payloadSegment)) as AccessTokenPayload;
    if (!Array.isArray(payload.acciones)) return [];
    const actions = new Set<string>();

    for (const action of payload.acciones) {
      if (typeof action !== "string") {
        continue;
      }

      const normalized = action.trim().toUpperCase();

      if (normalized) {
        actions.add(normalized);
      }
    }

    return [...actions];
  } catch {
    return [];
  }
}

export function getSessionActionNames(user?: AuthenticatedUser | null): string[] {
  return [...new Set([...getUserActionNames(user), ...getAccessTokenActionNames()])];
}

export function sessionHasExactAction(
  user: AuthenticatedUser | null | undefined,
  action: string,
): boolean {
  return getSessionActionNames(user).includes(action.trim().toUpperCase());
}
