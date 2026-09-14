import { DEFAULT_APPEARANCE } from "@/features/appearance-settings/model/appearance.defaults";
import {
  applyAppearance,
  resolveStoredAppearance,
} from "@/features/appearance-settings/model/appearance.utils";
import { getContrastRatio } from "@/features/appearance-settings/model/color-contrast";

const legacyPalette = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  primaryActive: "#1e40af",
  secondary: "#6366f1",
  accent: "#f59e0b",
};

describe("appearance utils", () => {
  it("aplica tokens semánticos al elemento raíz", () => {
    applyAppearance({ ...DEFAULT_APPEARANCE, primary: "#611232", cardRadius: 16 });

    expect(document.documentElement.style.getPropertyValue("--ui-primary")).toBe("#611232");
    expect(document.documentElement.style.getPropertyValue("--ui-card-radius")).toBe("16px");
  });

  it("actualiza la paleta heredada y conserva las otras preferencias sin mutar el borrador", () => {
    const stored = { ...DEFAULT_APPEARANCE, ...legacyPalette, cardRadius: 18 };
    const resolved = resolveStoredAppearance(stored);

    expect(resolved.primary).toBe(DEFAULT_APPEARANCE.primary);
    expect(resolved.accent).toBe(DEFAULT_APPEARANCE.accent);
    expect(resolved.cardRadius).toBe(18);
    expect(stored.primary).toBe(legacyPalette.primary);
  });

  it("conserva una paleta personalizada por el administrador", () => {
    const stored = { ...DEFAULT_APPEARANCE, ...legacyPalette, primary: "#611232" };

    expect(resolveStoredAppearance(stored)).toEqual(stored);
  });

  it("migra el sidebar predeterminado anterior a la identidad de Configuración", () => {
    const stored = {
      ...DEFAULT_APPEARANCE,
      sidebar: "#0f1a31",
      sidebarText: "#94a3b8",
      cardRadius: 18,
    };
    const resolved = resolveStoredAppearance(stored);

    expect(resolved.sidebar).toBe(DEFAULT_APPEARANCE.sidebar);
    expect(resolved.sidebarText).toBe(DEFAULT_APPEARANCE.sidebarText);
    expect(resolved.cardRadius).toBe(18);
  });

  it("conserva un sidebar personalizado por el administrador", () => {
    const stored = { ...DEFAULT_APPEARANCE, sidebar: "#611232", sidebarText: "#ffffff" };

    expect(resolveStoredAppearance(stored)).toEqual(stored);
  });

  it.each(["primary", "primaryHover", "primaryActive"] as const)(
    "mantiene contraste AA entre texto y el estado %s del botón principal",
    (state) => {
      expect(
        getContrastRatio(DEFAULT_APPEARANCE.textOnPrimary, DEFAULT_APPEARANCE[state]),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("mantiene contraste AA en el sidebar predeterminado", () => {
    expect(
      getContrastRatio(DEFAULT_APPEARANCE.sidebarText, DEFAULT_APPEARANCE.sidebar),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("mantiene contraste AA en enlaces y opciones seleccionadas sobre el fondo suave", () => {
    applyAppearance(DEFAULT_APPEARANCE);
    const soft = document.documentElement.style.getPropertyValue("--ui-primary-soft");

    expect(getContrastRatio(DEFAULT_APPEARANCE.primary, soft)).toBeGreaterThanOrEqual(4.5);
    expect(
      getContrastRatio(DEFAULT_APPEARANCE.primary, DEFAULT_APPEARANCE.canvas),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
