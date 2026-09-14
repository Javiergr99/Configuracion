import type {
  AppearanceConfig,
  FontFamilyOption,
} from "@/features/appearance-settings/model/appearance.types";

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  primary: "#a85400",
  primaryHover: "#8f4700",
  primaryActive: "#753a00",
  secondary: "#92400e",
  accent: "#e47a00",
  canvas: "#f4f7fb",
  surface: "#ffffff",
  elevated: "#ffffff",
  header: "#ffffff",
  sidebar: "#a85400",
  fieldBackground: "#ffffff",
  textPrimary: "#111827",
  textSecondary: "#64748b",
  textDisabled: "#94a3b8",
  textOnPrimary: "#ffffff",
  sidebarText: "#ffffff",
  border: "#dce3ec",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  fontFamily: "inter",
  headingWeight: 700,
  bodyWeight: 400,
  cardRadius: 12,
  controlRadius: 8,
};

export const FONT_STACKS: Record<FontFamilyOption, string> = {
  inter: '"Inter", "Segoe UI", Arial, sans-serif',
  "noto-sans": '"Noto Sans", "Segoe UI", Arial, sans-serif',
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

export const APPEARANCE_STORAGE_KEY = "ecosistema-dgcp-configuracion-appearance-v1";
