import {
  DEFAULT_APPEARANCE,
  FONT_STACKS,
} from "@/features/appearance-settings/model/appearance.defaults";
import type { AppearanceConfig } from "@/features/appearance-settings/model/appearance.types";

export function normalizeHex(value: string, fallback = DEFAULT_APPEARANCE.primary): string {
  const trimmed = value.trim();
  return /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed.toLowerCase() : fallback;
}

const LEGACY_DEFAULT_PALETTE = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  primaryActive: "#1e40af",
  secondary: "#6366f1",
  accent: "#f59e0b",
} satisfies Partial<AppearanceConfig>;

const PREVIOUS_CONFIGURATION_SIDEBAR = {
  sidebar: "#0f1a31",
  sidebarText: "#94a3b8",
} satisfies Pick<AppearanceConfig, "sidebar" | "sidebarText">;

export function resolveStoredAppearance(stored: Partial<AppearanceConfig>): AppearanceConfig {
  const config = { ...DEFAULT_APPEARANCE, ...stored };
  const paletteKeys = Object.keys(LEGACY_DEFAULT_PALETTE) as Array<
    keyof typeof LEGACY_DEFAULT_PALETTE
  >;
  const usesLegacyPalette = paletteKeys.every(
    (key) => config[key].toLowerCase() === LEGACY_DEFAULT_PALETTE[key],
  );

  const resolved = usesLegacyPalette
    ? {
        ...config,
        primary: DEFAULT_APPEARANCE.primary,
        primaryHover: DEFAULT_APPEARANCE.primaryHover,
        primaryActive: DEFAULT_APPEARANCE.primaryActive,
        secondary: DEFAULT_APPEARANCE.secondary,
        accent: DEFAULT_APPEARANCE.accent,
      }
    : config;

  const usesPreviousDefaultSidebar =
    resolved.sidebar.toLowerCase() === PREVIOUS_CONFIGURATION_SIDEBAR.sidebar &&
    resolved.sidebarText.toLowerCase() === PREVIOUS_CONFIGURATION_SIDEBAR.sidebarText;

  if (!usesPreviousDefaultSidebar) return resolved;

  // Migrar sólo la combinación predeterminada anterior. Un sidebar personalizado
  // por el administrador se conserva intacto y la lectura sigue sin persistir cambios.
  return {
    ...resolved,
    sidebar: DEFAULT_APPEARANCE.sidebar,
    sidebarText: DEFAULT_APPEARANCE.sidebarText,
  };
}

function mix(hex: string, target: "#000000" | "#ffffff", ratio: number): string {
  const source = normalizeHex(hex).slice(1);
  const targetValue = target.slice(1);
  const channels = [0, 2, 4].map((index) => {
    const from = Number.parseInt(source.slice(index, index + 2), 16);
    const to = Number.parseInt(targetValue.slice(index, index + 2), 16);
    return Math.round(from + (to - from) * ratio)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

export function applyAppearance(config: AppearanceConfig): void {
  const root = document.documentElement;
  const primary = normalizeHex(config.primary);
  const values: Record<string, string> = {
    "--ui-primary": primary,
    "--ui-primary-hover": normalizeHex(config.primaryHover, mix(primary, "#000000", 0.16)),
    "--ui-primary-active": normalizeHex(config.primaryActive, mix(primary, "#000000", 0.28)),
    "--ui-primary-soft": mix(primary, "#ffffff", 0.92),
    "--ui-secondary": normalizeHex(config.secondary),
    "--ui-accent": normalizeHex(config.accent),
    "--ui-canvas": normalizeHex(config.canvas, "#f4f7fb"),
    "--ui-surface": normalizeHex(config.surface, "#ffffff"),
    "--ui-elevated": normalizeHex(config.elevated, "#ffffff"),
    "--ui-header": normalizeHex(config.header, "#ffffff"),
    "--ui-sidebar": normalizeHex(config.sidebar, DEFAULT_APPEARANCE.sidebar),
    "--ui-field-bg": normalizeHex(config.fieldBackground, "#ffffff"),
    "--ui-sidebar-text": normalizeHex(config.sidebarText, DEFAULT_APPEARANCE.sidebarText),
    "--ui-text-primary": normalizeHex(config.textPrimary, "#111827"),
    "--ui-text-secondary": normalizeHex(config.textSecondary, "#64748b"),
    "--ui-text-disabled": normalizeHex(config.textDisabled, "#94a3b8"),
    "--ui-text-on-primary": normalizeHex(config.textOnPrimary, "#ffffff"),
    "--ui-border": normalizeHex(config.border, "#dce3ec"),
    "--ui-success": normalizeHex(config.success, "#10b981"),
    "--ui-warning": normalizeHex(config.warning, "#f59e0b"),
    "--ui-danger": normalizeHex(config.danger, "#ef4444"),
    "--ui-info": normalizeHex(config.info, "#3b82f6"),
    "--ui-font-family": FONT_STACKS[config.fontFamily],
    "--ui-heading-weight": String(config.headingWeight),
    "--ui-body-weight": String(config.bodyWeight),
    "--ui-card-radius": `${config.cardRadius}px`,
    "--ui-control-radius": `${config.controlRadius}px`,
    "--ui-focus-ring": `${primary}38`,
  };

  Object.entries(values).forEach(([property, value]) => root.style.setProperty(property, value));
}
