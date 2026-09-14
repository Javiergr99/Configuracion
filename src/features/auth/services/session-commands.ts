import { queryClient } from "@/app/providers/query-client";
import { authService } from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { redirectToAuthLogout } from "@/features/auth/services/auth-navigation";
import { authTokenStorage } from "@/features/auth/services/token-storage";

export const AUTH_CHANNEL = "ecosistema-configuracion-auth-session";

export type SessionMessage = {
  type: "logout";
  reason: "manual" | "inactivity" | "session-expired";
};

export async function logoutCurrentSession(reason: SessionMessage["reason"] = "manual") {
  try {
    await authService.logout();
  } catch {
    // La sesión local siempre se elimina aunque el logout remoto falle.
  } finally {
    authTokenStorage.clear();
    queryClient.clear();
    useAuthStore.getState().setAnonymous();

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(AUTH_CHANNEL);
      channel.postMessage({ type: "logout", reason } satisfies SessionMessage);
      channel.close();
    }

    redirectToAuthLogout(reason);
  }
}
