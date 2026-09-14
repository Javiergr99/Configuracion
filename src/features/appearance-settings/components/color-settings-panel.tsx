import { ColorTokenField } from "@/features/appearance-settings/components/color-token-field";
import { PendingChangesSummary } from "@/features/appearance-settings/components/pending-changes-summary";
import { SettingsSection } from "@/features/appearance-settings/components/settings-section";
import { useAppearanceStore } from "@/features/appearance-settings/model/appearance.store";
import type {
  AppearanceColorKey,
  AppearanceConfig,
} from "@/features/appearance-settings/model/appearance.types";

const colorGroups: Array<{
  title: string;
  fields: Array<{
    key: AppearanceColorKey;
    label: string;
    token: string;
    contrastWith: AppearanceColorKey;
  }>;
}> = [
  {
    title: "Colores de marca",
    fields: [
      {
        key: "primary",
        label: "Color principal",
        token: "--color-primary",
        contrastWith: "textOnPrimary",
      },
      {
        key: "primaryHover",
        label: "Color principal hover",
        token: "--color-primary-hover",
        contrastWith: "textOnPrimary",
      },
      {
        key: "primaryActive",
        label: "Color principal activo",
        token: "--color-primary-active",
        contrastWith: "textOnPrimary",
      },
      {
        key: "secondary",
        label: "Color secundario",
        token: "--color-secondary",
        contrastWith: "textOnPrimary",
      },
      {
        key: "accent",
        label: "Color de acento",
        token: "--color-accent",
        contrastWith: "textPrimary",
      },
    ],
  },
  {
    title: "Superficies",
    fields: [
      { key: "canvas", label: "Fondo general", token: "--color-bg", contrastWith: "textPrimary" },
      {
        key: "surface",
        label: "Fondo de tarjetas",
        token: "--color-surface",
        contrastWith: "textPrimary",
      },
      {
        key: "elevated",
        label: "Fondo elevado",
        token: "--color-elevated",
        contrastWith: "textPrimary",
      },
      {
        key: "header",
        label: "Fondo del header",
        token: "--color-header-bg",
        contrastWith: "textPrimary",
      },
      {
        key: "sidebar",
        label: "Fondo del sidebar",
        token: "--color-sidebar-bg",
        contrastWith: "sidebarText",
      },
      {
        key: "fieldBackground",
        label: "Fondo de campos",
        token: "--color-field-bg",
        contrastWith: "textPrimary",
      },
      {
        key: "border",
        label: "Bordes y divisores",
        token: "--color-border",
        contrastWith: "surface",
      },
    ],
  },
  {
    title: "Textos",
    fields: [
      {
        key: "textPrimary",
        label: "Texto principal",
        token: "--color-text-primary",
        contrastWith: "surface",
      },
      {
        key: "textSecondary",
        label: "Texto secundario",
        token: "--color-text-secondary",
        contrastWith: "surface",
      },
      {
        key: "textDisabled",
        label: "Texto deshabilitado",
        token: "--color-text-disabled",
        contrastWith: "surface",
      },
      {
        key: "textOnPrimary",
        label: "Texto sobre primario",
        token: "--color-text-on-primary",
        contrastWith: "primary",
      },
      {
        key: "sidebarText",
        label: "Texto del sidebar",
        token: "--color-sidebar-text",
        contrastWith: "sidebar",
      },
    ],
  },
  {
    title: "Estados semánticos",
    fields: [
      { key: "success", label: "Éxito", token: "--color-success", contrastWith: "surface" },
      { key: "warning", label: "Advertencia", token: "--color-warning", contrastWith: "surface" },
      { key: "danger", label: "Error", token: "--color-error", contrastWith: "surface" },
      { key: "info", label: "Información", token: "--color-info", contrastWith: "surface" },
    ],
  },
];

const labelsByKey = new Map<keyof AppearanceConfig, string>([
  ...colorGroups.flatMap((group) => group.fields.map((field) => [field.key, field.label] as const)),
  ["fontFamily", "Tipografía"],
  ["headingWeight", "Peso de títulos"],
  ["bodyWeight", "Peso de texto"],
  ["cardRadius", "Radio de tarjetas"],
  ["controlRadius", "Radio de controles"],
]);

function getChangedKeys(
  draft: AppearanceConfig,
  persisted: AppearanceConfig,
): Array<keyof AppearanceConfig> {
  return (Object.keys(draft) as Array<keyof AppearanceConfig>).filter(
    (key) => draft[key] !== persisted[key],
  );
}

export function ColorSettingsPanel() {
  const draft = useAppearanceStore((state) => state.draft);
  const persisted = useAppearanceStore((state) => state.persisted);
  const update = useAppearanceStore((state) => state.update);
  const changedLabels = getChangedKeys(draft, persisted).map(
    (key) => labelsByKey.get(key) ?? String(key),
  );

  return (
    <div className="min-w-0 space-y-5 px-5 py-4">
      {colorGroups.map((group) => (
        <SettingsSection key={group.title} title={group.title}>
          <div>
            {group.fields.map((field) => (
              <ColorTokenField
                key={field.key}
                label={field.label}
                token={field.token}
                value={draft[field.key]}
                persistedValue={persisted[field.key]}
                contrastAgainst={draft[field.contrastWith]}
                onChange={(value) => update(field.key, value)}
              />
            ))}
          </div>
        </SettingsSection>
      ))}
      <PendingChangesSummary labels={changedLabels} />
    </div>
  );
}
