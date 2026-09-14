export type IdentityAvatarMode = "initials" | "image";
export type IdentityLogoAlignment = "left" | "center" | "right";
export type IdentityAllowedBackground = "all" | "light" | "dark" | "primary";

export type IdentityConfig = {
  systemName: string;
  shortName: string;
  versionText: string;
  institutionalDescription: string;
  responsibleInstitution: string;
  institutionalInitials: string;
  avatarMode: IdentityAvatarMode;
  avatarInitials: string;
  avatarBackground: string;
  avatarTextColor: string;
  logoMinSize: number;
  logoSafeSpace: number;
  logoAlignment: IdentityLogoAlignment;
  logoAllowedBackground: IdentityAllowedBackground;
  useCompactVersion: boolean;
};

export type IdentityAssetKind =
  | "primaryLogo"
  | "compactLogo"
  | "favicon"
  | "lightLogo"
  | "darkLogo"
  | "monochromeLogo"
  | "institutionalImage"
  | "avatarImage";

export type IdentityAssetDraft = {
  kind: IdentityAssetKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl: string;
};
