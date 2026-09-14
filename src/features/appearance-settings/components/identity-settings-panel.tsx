import { Activity } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { AlternativeAssetRow } from "@/features/appearance-settings/components/alternative-asset-row";
import { IdentityAssetUploader } from "@/features/appearance-settings/components/identity-asset-uploader";
import { IdentityCurrentAsset } from "@/features/appearance-settings/components/identity-current-asset";
import { PendingChangesSummary } from "@/features/appearance-settings/components/pending-changes-summary";
import { SettingsField } from "@/features/appearance-settings/components/settings-field";
import { SettingsSection } from "@/features/appearance-settings/components/settings-section";
import { SettingsSwitch } from "@/features/appearance-settings/components/settings-switch";
import { SettingsTextControl } from "@/features/appearance-settings/components/settings-text-control";
import { useIdentityAssetPreviewStore } from "@/features/appearance-settings/model/identity-assets.store";
import { useIdentityStore } from "@/features/appearance-settings/model/identity.store";
import type { IdentityConfig } from "@/features/appearance-settings/model/identity.types";

const identityLabels: Record<keyof IdentityConfig, string> = {
  systemName: "Nombre visible",
  shortName: "Nombre corto",
  versionText: "Texto de versión",
  institutionalDescription: "Descripción institucional",
  responsibleInstitution: "Institución responsable",
  institutionalInitials: "Siglas institucionales",
  avatarMode: "Avatar predeterminado",
  avatarInitials: "Iniciales del avatar",
  avatarBackground: "Fondo del avatar",
  avatarTextColor: "Texto del avatar",
  logoMinSize: "Tamaño mínimo",
  logoSafeSpace: "Espacio de seguridad",
  logoAlignment: "Alineación predeterminada",
  logoAllowedBackground: "Fondo permitido",
  useCompactVersion: "Uso de versión compacta",
};

function getChangedIdentityKeys(
  draft: IdentityConfig,
  persisted: IdentityConfig,
): Array<keyof IdentityConfig> {
  return (Object.keys(draft) as Array<keyof IdentityConfig>).filter(
    (key) => draft[key] !== persisted[key],
  );
}

export function IdentitySettingsPanel() {
  const draft = useIdentityStore((state) => state.draft);
  const persisted = useIdentityStore((state) => state.persisted);
  const update = useIdentityStore((state) => state.update);
  const setAssetPreview = useIdentityAssetPreviewStore((state) => state.setPreview);

  const changedLabels = getChangedIdentityKeys(draft, persisted).map((key) => identityLabels[key]);

  return (
    <div className="min-w-0 space-y-5 px-5 py-4">
      <div className="flex min-h-8 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50/60 px-2.5 text-[9px] font-semibold text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Borrador local disponible para
        edición
      </div>

      <SettingsSection title="Información del sistema">
        <div className="space-y-3">
          <SettingsTextControl
            label="Nombre visible"
            value={draft.systemName}
            persistedValue={persisted.systemName}
            onChange={(value) => update("systemName", value)}
            maxLength={80}
          />
          <SettingsTextControl
            label="Nombre corto"
            value={draft.shortName}
            persistedValue={persisted.shortName}
            onChange={(value) => update("shortName", value)}
            maxLength={16}
          />
          <SettingsTextControl
            label="Texto de versión"
            value={draft.versionText}
            persistedValue={persisted.versionText}
            onChange={(value) => update("versionText", value)}
            maxLength={24}
          />
          <SettingsTextControl
            label="Descripción institucional"
            value={draft.institutionalDescription}
            persistedValue={persisted.institutionalDescription}
            onChange={(value) => update("institutionalDescription", value)}
            multiline
            maxLength={180}
          />
          <SettingsTextControl
            label="Institución responsable"
            value={draft.responsibleInstitution}
            persistedValue={persisted.responsibleInstitution}
            onChange={(value) => update("responsibleInstitution", value)}
            maxLength={120}
          />
          <SettingsTextControl
            label="Siglas institucionales"
            value={draft.institutionalInitials}
            persistedValue={persisted.institutionalInitials}
            onChange={(value) => update("institutionalInitials", value)}
            maxLength={16}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Logotipo principal">
        <div className="space-y-4">
          <IdentityCurrentAsset
            label="Logotipo actual"
            variant="logo"
            onFileChange={(_file, previewUrl) => setAssetPreview("primaryLogo", previewUrl)}
          />
          <IdentityAssetUploader
            label="Subir nuevo logotipo"
            onFileChange={(_file, previewUrl) => setAssetPreview("primaryLogo", previewUrl)}
          />
          <p className="text-[8px] text-slate-400">Formatos permitidos: SVG, PNG, WebP.</p>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Logotipo compacto"
        description="Sidebar contraído · Favicon ampliado · Espacios reducidos"
      >
        <div className="grid grid-cols-2 gap-2">
          <IdentityCurrentAsset
            label="Fondo claro"
            variant="compact"
            onFileChange={(_file, previewUrl) => setAssetPreview("compactLogo", previewUrl)}
          />
          <IdentityCurrentAsset
            label="Fondo oscuro"
            variant="compact"
            dark
            onFileChange={(_file, previewUrl) => setAssetPreview("compactLogo", previewUrl)}
          />
        </div>
        <div className="mt-3">
          <IdentityAssetUploader
            label="Reemplazar versión compacta"
            compact
            onFileChange={(_file, previewUrl) => setAssetPreview("compactLogo", previewUrl)}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Favicon" description="Formatos: SVG, PNG, ICO">
        <IdentityCurrentAsset
          label="Favicon actual"
          variant="favicon"
          accept=".svg,.png,.ico"
          onFileChange={(_file, previewUrl) => setAssetPreview("favicon", previewUrl)}
        />
        <div className="mt-3">
          <IdentityAssetUploader
            label="Reemplazar favicon"
            compact
            accept=".svg,.png,.ico"
            onFileChange={(_file, previewUrl) => setAssetPreview("favicon", previewUrl)}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Avatar institucional predeterminado"
        description="Se utiliza cuando un usuario no tiene fotografía de perfil."
      >
        <div className="flex items-start gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12px] font-bold shadow-sm"
            style={{ backgroundColor: draft.avatarBackground, color: draft.avatarTextColor }}
          >
            {draft.avatarMode === "initials" ? (
              draft.avatarInitials
            ) : (
              <Activity className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-medium text-[var(--ui-text-primary)]">
              <input
                type="radio"
                name="avatar-mode"
                checked={draft.avatarMode === "initials"}
                onChange={() => update("avatarMode", "initials")}
              />
              Usar iniciales
            </label>
            <label className="flex items-center gap-2 text-[10px] font-medium text-[var(--ui-text-primary)]">
              <input
                type="radio"
                name="avatar-mode"
                checked={draft.avatarMode === "image"}
                onChange={() => update("avatarMode", "image")}
              />
              Subir imagen
            </label>
          </div>
        </div>

        {draft.avatarMode === "initials" ? (
          <div className="mt-3 grid grid-cols-[1fr_76px_76px] gap-2">
            <SettingsField
              label="Iniciales"
              edited={draft.avatarInitials !== persisted.avatarInitials}
            >
              <Input
                value={draft.avatarInitials}
                maxLength={3}
                onChange={(event) => update("avatarInitials", event.target.value.toUpperCase())}
                className="h-8 px-2 text-[10px] uppercase"
              />
            </SettingsField>
            <SettingsField
              label="Fondo"
              edited={draft.avatarBackground !== persisted.avatarBackground}
            >
              <label className="flex h-8 items-center gap-1.5 rounded-[var(--ui-control-radius)] border border-[var(--ui-border)] px-1.5">
                <input
                  type="color"
                  value={draft.avatarBackground}
                  onChange={(event) => update("avatarBackground", event.target.value)}
                  className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span className="text-[8px] text-slate-500">{draft.avatarBackground}</span>
              </label>
            </SettingsField>
            <SettingsField
              label="Texto"
              edited={draft.avatarTextColor !== persisted.avatarTextColor}
            >
              <label className="flex h-8 items-center gap-1.5 rounded-[var(--ui-control-radius)] border border-[var(--ui-border)] px-1.5">
                <input
                  type="color"
                  value={draft.avatarTextColor}
                  onChange={(event) => update("avatarTextColor", event.target.value)}
                  className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span className="text-[8px] text-slate-500">{draft.avatarTextColor}</span>
              </label>
            </SettingsField>
          </div>
        ) : (
          <div className="mt-3">
            <IdentityAssetUploader
              label="Imagen del avatar"
              compact
              onFileChange={(_file, previewUrl) => setAssetPreview("avatarImage", previewUrl)}
            />
          </div>
        )}
      </SettingsSection>

      <SettingsSection title="Recursos alternativos">
        <div>
          <AlternativeAssetRow label="Logotipo fondo claro" />
          <AlternativeAssetRow label="Logotipo fondo oscuro" />
          <AlternativeAssetRow label="Versión monocromática" initialStatus="Pendiente" />
          <AlternativeAssetRow label="Imagen institucional" />
        </div>
      </SettingsSection>

      <SettingsSection title="Reglas de uso">
        <div className="space-y-2.5">
          <div className="grid grid-cols-[1fr_84px] items-center gap-3">
            <span className="text-[10px] text-[var(--ui-text-secondary)]">Tamaño mínimo</span>
            <Input
              type="number"
              min={16}
              max={96}
              value={draft.logoMinSize}
              onChange={(event) =>
                update("logoMinSize", Number.parseInt(event.target.value, 10) || 16)
              }
              className="h-7 px-2 text-[9px]"
            />
          </div>
          <div className="grid grid-cols-[1fr_84px] items-center gap-3">
            <span className="text-[10px] text-[var(--ui-text-secondary)]">
              Espacio de seguridad
            </span>
            <Input
              type="number"
              min={0}
              max={48}
              value={draft.logoSafeSpace}
              onChange={(event) =>
                update("logoSafeSpace", Number.parseInt(event.target.value, 10) || 0)
              }
              className="h-7 px-2 text-[9px]"
            />
          </div>
          <div className="grid grid-cols-[1fr_110px] items-center gap-3">
            <span className="text-[10px] text-[var(--ui-text-secondary)]">
              Alineación predeterminada
            </span>
            <SelectField
              value={draft.logoAlignment}
              onValueChange={(value) =>
                update("logoAlignment", value as IdentityConfig["logoAlignment"])
              }
              options={[
                { label: "Izquierda", value: "left" },
                { label: "Centro", value: "center" },
                { label: "Derecha", value: "right" },
              ]}
              triggerClassName="h-7 px-2 text-[9px]"
            />
          </div>
          <div className="grid grid-cols-[1fr_110px] items-center gap-3">
            <span className="text-[10px] text-[var(--ui-text-secondary)]">Fondo permitido</span>
            <SelectField
              value={draft.logoAllowedBackground}
              onValueChange={(value) =>
                update("logoAllowedBackground", value as IdentityConfig["logoAllowedBackground"])
              }
              options={[
                { label: "Todos", value: "all" },
                { label: "Claro", value: "light" },
                { label: "Oscuro", value: "dark" },
                { label: "Principal", value: "primary" },
              ]}
              triggerClassName="h-7 px-2 text-[9px]"
            />
          </div>
          <div className="flex min-h-7 items-center justify-between gap-3">
            <span className="text-[10px] text-[var(--ui-text-secondary)]">
              Uso de versión compacta
            </span>
            <SettingsSwitch
              checked={draft.useCompactVersion}
              onCheckedChange={(checked) => update("useCompactVersion", checked)}
              label="Uso de versión compacta"
            />
          </div>
        </div>
      </SettingsSection>

      <PendingChangesSummary labels={changedLabels} />
    </div>
  );
}
