import { create } from "zustand";

import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
} from "@/features/appearance-settings/model/appearance.defaults";
import type { AppearanceConfig } from "@/features/appearance-settings/model/appearance.types";
import {
  applyAppearance,
  resolveStoredAppearance,
} from "@/features/appearance-settings/model/appearance.utils";

type AppearanceStore = {
  persisted: AppearanceConfig;
  draft: AppearanceConfig;
  hydrated: boolean;
  hydrate: () => void;
  syncFromStorage: () => void;
  update: <K extends keyof AppearanceConfig>(key: K, value: AppearanceConfig[K]) => void;
  save: () => void;
  discard: () => void;
  reset: () => void;
};

function readPersisted(): AppearanceConfig {
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    return resolveStoredAppearance(JSON.parse(raw) as Partial<AppearanceConfig>);
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

function persist(config: AppearanceConfig) {
  localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(config));
}

export const useAppearanceStore = create<AppearanceStore>((set, get) => ({
  persisted: DEFAULT_APPEARANCE,
  draft: DEFAULT_APPEARANCE,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const config = readPersisted();
    applyAppearance(config);
    set({ persisted: config, draft: config, hydrated: true });
  },
  syncFromStorage: () => {
    const config = readPersisted();
    applyAppearance(config);
    set({ persisted: config, draft: config, hydrated: true });
  },
  update: (key, value) => {
    const draft = { ...get().draft, [key]: value };
    applyAppearance(draft);
    set({ draft });
  },
  save: () => {
    const draft = get().draft;
    persist(draft);
    applyAppearance(draft);
    set({ persisted: draft });
  },
  discard: () => {
    const persisted = get().persisted;
    applyAppearance(persisted);
    set({ draft: persisted });
  },
  reset: () => {
    localStorage.removeItem(APPEARANCE_STORAGE_KEY);
    applyAppearance(DEFAULT_APPEARANCE);
    set({ persisted: DEFAULT_APPEARANCE, draft: DEFAULT_APPEARANCE });
  },
}));
