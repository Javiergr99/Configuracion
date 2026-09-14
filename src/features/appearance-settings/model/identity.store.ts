import { create } from "zustand";

import {
  DEFAULT_IDENTITY,
  IDENTITY_STORAGE_KEY,
} from "@/features/appearance-settings/model/identity.defaults";
import type { IdentityConfig } from "@/features/appearance-settings/model/identity.types";

type IdentityStore = {
  persisted: IdentityConfig;
  draft: IdentityConfig;
  hydrated: boolean;
  hydrate: () => void;
  update: <K extends keyof IdentityConfig>(key: K, value: IdentityConfig[K]) => void;
  save: () => void;
  discard: () => void;
  reset: () => void;
};

function readPersisted(): IdentityConfig {
  try {
    const raw = localStorage.getItem(IDENTITY_STORAGE_KEY);
    if (!raw) return DEFAULT_IDENTITY;
    return { ...DEFAULT_IDENTITY, ...(JSON.parse(raw) as Partial<IdentityConfig>) };
  } catch {
    return DEFAULT_IDENTITY;
  }
}

function persist(config: IdentityConfig) {
  localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(config));
}

export const useIdentityStore = create<IdentityStore>((set, get) => ({
  persisted: DEFAULT_IDENTITY,
  draft: DEFAULT_IDENTITY,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const config = readPersisted();
    set({ persisted: config, draft: config, hydrated: true });
  },
  update: (key, value) => {
    set({ draft: { ...get().draft, [key]: value } });
  },
  save: () => {
    const draft = get().draft;
    persist(draft);
    set({ persisted: draft });
  },
  discard: () => set({ draft: get().persisted }),
  reset: () => {
    localStorage.removeItem(IDENTITY_STORAGE_KEY);
    set({ persisted: DEFAULT_IDENTITY, draft: DEFAULT_IDENTITY });
  },
}));
