import { useEffect, useState } from "react";
import { RotateCcw, Save, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColorSettingsPanel } from "@/features/appearance-settings/components/color-settings-panel";
import { IdentitySettingsPanel } from "@/features/appearance-settings/components/identity-settings-panel";
import { IdentitySettingsPreview } from "@/features/appearance-settings/components/identity-settings-preview";
import { SettingsInfoBanner } from "@/features/appearance-settings/components/settings-info-banner";
import {
  SettingsNavigation,
  type SettingsSectionId,
} from "@/features/appearance-settings/components/settings-navigation";
import { SettingsPageHeader } from "@/features/appearance-settings/components/settings-page-header";
import { SettingsPreview } from "@/features/appearance-settings/components/settings-preview";
import { useAppearanceStore } from "@/features/appearance-settings/model/appearance.store";
import { useIdentityAssetPreviewStore } from "@/features/appearance-settings/model/identity-assets.store";
import { useIdentityStore } from "@/features/appearance-settings/model/identity.store";

const sectionDescriptions: Partial<Record<SettingsSectionId, string>> = {
  identity:
    "Administra la identidad institucional y los recursos gráficos globales del Ecosistema Integral DGCP.",
  colors:
    "Personaliza la identidad visual global del Ecosistema Integral DGCP mediante Design Tokens reutilizables.",
};

export function AppearanceSettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("identity");

  const saveAppearance = useAppearanceStore((state) => state.save);
  const resetAppearance = useAppearanceStore((state) => state.reset);
  const hydrateIdentity = useIdentityStore((state) => state.hydrate);
  const saveIdentity = useIdentityStore((state) => state.save);
  const resetIdentity = useIdentityStore((state) => state.reset);
  const clearIdentityAssets = useIdentityAssetPreviewStore((state) => state.clear);

  useEffect(() => {
    hydrateIdentity();
  }, [hydrateIdentity]);

  const handleSectionSelect = (sectionId: SettingsSectionId) => {
    if (sectionId === "identity" || sectionId === "colors") {
      setActiveSection(sectionId);
      return;
    }
    toast.info("Esta categoría se implementará cuando su diseño sea aprobado.");
  };

  const handleReset = () => {
    if (activeSection === "identity") {
      resetIdentity();
      clearIdentityAssets();
      toast.success("Se restauró la identidad institucional predeterminada.");
      return;
    }
    resetAppearance();
    toast.success("Se restauró la configuración visual institucional predeterminada.");
  };

  const handleSaveDraft = () => {
    if (activeSection === "identity") {
      saveIdentity();
      toast.success("Borrador de identidad guardado localmente.");
      return;
    }
    saveAppearance();
    toast.success("Borrador visual guardado en este navegador.");
  };

  const handlePublish = () => {
    if (activeSection === "identity") saveIdentity();
    else saveAppearance();
    toast.info(
      "La interfaz está preparada para publicación global; falta conectar el contrato de persistencia de Design Tokens y recursos institucionales en backend.",
    );
  };

  const identityActive = activeSection === "identity";

  return (
    <div className="app-page appearance-settings-page">
      <SettingsPageHeader
        description={sectionDescriptions[activeSection]}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" /> Restablecer valores
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSaveDraft}>
              <Save className="h-3.5 w-3.5" /> Guardar borrador
            </Button>
            <Button size="sm" onClick={handlePublish}>
              <Send className="h-3.5 w-3.5" /> Publicar cambios
            </Button>
          </>
        }
      />

      <SettingsInfoBanner message="La interfaz prepara una configuración global; la publicación efectiva dependerá del contrato de persistencia que backend publique para el ecosistema." />

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,560px)_minmax(360px,1fr)]">
        <Card className="min-w-0 overflow-hidden p-0">
          <div className="grid min-w-0 grid-cols-[150px_minmax(0,1fr)]">
            <SettingsNavigation activeSection={activeSection} onSelect={handleSectionSelect} />
            {identityActive ? <IdentitySettingsPanel /> : <ColorSettingsPanel />}
          </div>
        </Card>

        {identityActive ? <IdentitySettingsPreview /> : <SettingsPreview />}
      </div>
    </div>
  );
}
