import { useEffect, type ReactNode } from "react";

import { APPEARANCE_STORAGE_KEY } from "@/features/appearance-settings/model/appearance.defaults";
import { useAppearanceStore } from "@/features/appearance-settings/model/appearance.store";

export function AppearanceRuntimeProvider({ children }: { children: ReactNode }) {
  const hydrate = useAppearanceStore((state) => state.hydrate);
  const syncFromStorage = useAppearanceStore((state) => state.syncFromStorage);

  useEffect(() => {
    hydrate();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === APPEARANCE_STORAGE_KEY || event.key === null) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [hydrate, syncFromStorage]);

  return children;
}
