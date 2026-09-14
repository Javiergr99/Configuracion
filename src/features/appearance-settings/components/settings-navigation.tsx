import {
  BarChart3,
  Boxes,
  Building2,
  Grid3X3,
  Move,
  Navigation,
  Palette,
  Send,
  Type,
} from "lucide-react";

import { cn } from "@/shared/lib/cn";

export type SettingsSectionId =
  | "identity"
  | "colors"
  | "typography"
  | "components"
  | "navigation"
  | "iconography"
  | "spacing"
  | "graphics"
  | "publication";

const sections: Array<{
  id: SettingsSectionId;
  label: string;
  icon: typeof Building2;
  hasChanges: boolean;
}> = [
  { id: "identity", label: "Identidad", icon: Building2, hasChanges: false },
  { id: "colors", label: "Colores", icon: Palette, hasChanges: false },
  { id: "typography", label: "Tipografía", icon: Type, hasChanges: false },
  { id: "components", label: "Componentes", icon: Boxes, hasChanges: false },
  { id: "navigation", label: "Navegación", icon: Navigation, hasChanges: false },
  { id: "iconography", label: "Iconografía", icon: Grid3X3, hasChanges: false },
  { id: "spacing", label: "Espaciado", icon: Move, hasChanges: false },
  { id: "graphics", label: "Gráficos", icon: BarChart3, hasChanges: false },
  { id: "publication", label: "Publicación", icon: Send, hasChanges: true },
];

export function SettingsNavigation({
  activeSection = "colors",
  onSelect,
}: {
  activeSection?: SettingsSectionId;
  onSelect?: (sectionId: SettingsSectionId) => void;
}) {
  return (
    <nav
      className="flex h-full flex-col border-r border-[var(--ui-border)] bg-slate-50/70 py-2"
      aria-label="Categorías de configuración visual"
    >
      {sections.map(({ id, label, icon: Icon, hasChanges }) => {
        const isActive = id === activeSection;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect?.(id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "focus-ring relative flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-[13px] font-semibold transition",
              "text-slate-500 hover:bg-white hover:text-slate-800",
              isActive && "bg-white text-[var(--ui-primary)]",
            )}
          >
            {isActive ? (
              <span
                className="absolute inset-y-0 left-0 w-0.5 bg-[var(--ui-primary)]"
                aria-hidden="true"
              />
            ) : null}
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {isActive || hasChanges ? (
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ui-accent)]" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
