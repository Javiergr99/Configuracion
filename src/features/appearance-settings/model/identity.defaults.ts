import type { IdentityConfig } from "@/features/appearance-settings/model/identity.types";

export const DEFAULT_IDENTITY: IdentityConfig = {
  systemName: "Ecosistema Integral DGCP",
  shortName: "DGCP",
  versionText: "Configuración",
  institutionalDescription: "Ecosistema modular de aplicaciones y servicios digitales de la DGCP.",
  responsibleInstitution: "Sistema Nacional para el Desarrollo Integral de la Familia",
  institutionalInitials: "SNDIF",
  avatarMode: "initials",
  avatarInitials: "DG",
  avatarBackground: "#A85400",
  avatarTextColor: "#FFFFFF",
  logoMinSize: 24,
  logoSafeSpace: 8,
  logoAlignment: "left",
  logoAllowedBackground: "all",
  useCompactVersion: true,
};

export const IDENTITY_STORAGE_KEY = "ecosistema-dgcp-configuracion-identity-v1";
