export type FontFamilyOption = "inter" | "noto-sans" | "system";
export type FontWeightOption = 400 | 500 | 600 | 700 | 800;

export type AppearanceColorKey =
  | "primary"
  | "primaryHover"
  | "primaryActive"
  | "secondary"
  | "accent"
  | "canvas"
  | "surface"
  | "elevated"
  | "header"
  | "sidebar"
  | "fieldBackground"
  | "textPrimary"
  | "textSecondary"
  | "textDisabled"
  | "textOnPrimary"
  | "sidebarText"
  | "border"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type AppearanceConfig = Record<AppearanceColorKey, string> & {
  fontFamily: FontFamilyOption;
  headingWeight: FontWeightOption;
  bodyWeight: 400 | 500;
  cardRadius: number;
  controlRadius: number;
};
