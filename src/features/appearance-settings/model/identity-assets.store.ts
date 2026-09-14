import { create } from "zustand";

import type { IdentityAssetKind } from "@/features/appearance-settings/model/identity.types";

type IdentityAssetPreviewStore = {
  previews: Partial<Record<IdentityAssetKind, string>>;
  setPreview: (kind: IdentityAssetKind, url: string | null) => void;
  clear: () => void;
};

export const useIdentityAssetPreviewStore = create<IdentityAssetPreviewStore>((set) => ({
  previews: {},
  setPreview: (kind, url) => {
    set((state) => {
      const next = { ...state.previews };
      if (url) next[kind] = url;
      else delete next[kind];
      return { previews: next };
    });
  },
  clear: () => set({ previews: {} }),
}));
