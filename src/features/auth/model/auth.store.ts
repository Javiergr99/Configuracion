import { create } from "zustand";

import type { AuthenticatedUser } from "@/features/auth/api/auth.contracts";

export type AuthSessionStatus = "checking" | "exchanging" | "authenticated" | "anonymous" | "error";

type AuthState = {
  user: AuthenticatedUser | null;
  status: AuthSessionStatus;
  error: string | null;
  setChecking: () => void;
  setExchanging: () => void;
  setAuthenticated: (user: AuthenticatedUser) => void;
  setAnonymous: () => void;
  setError: (message: string) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "checking",
  error: null,
  setChecking: () => set({ status: "checking", error: null }),
  setExchanging: () => set({ status: "exchanging", error: null }),
  setAuthenticated: (user) => set({ user, status: "authenticated", error: null }),
  setAnonymous: () => set({ user: null, status: "anonymous", error: null }),
  setError: (message) => set({ user: null, status: "error", error: message }),
}));
