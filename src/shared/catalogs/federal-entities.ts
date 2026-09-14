import type { NumericCatalogOption } from "@/shared/catalogs/catalog.types";

export const FEDERAL_ENTITY_CATALOG: readonly NumericCatalogOption[] = [
  { id: 1, key: "AGS", label: "Aguascalientes" },
  { id: 2, key: "BC", label: "Baja California" },
  { id: 3, key: "BCS", label: "Baja California Sur" },
  { id: 4, key: "CAM", label: "Campeche" },
  { id: 5, key: "COAH", label: "Coahuila" },
  { id: 6, key: "COL", label: "Colima" },
  { id: 7, key: "CHIS", label: "Chiapas" },
  { id: 8, key: "CHIH", label: "Chihuahua" },
  { id: 9, key: "CDMX", label: "Ciudad de México" },
  { id: 10, key: "DGO", label: "Durango" },
  { id: 11, key: "GTO", label: "Guanajuato" },
  { id: 12, key: "GRO", label: "Guerrero" },
  { id: 13, key: "HGO", label: "Hidalgo" },
  { id: 14, key: "JAL", label: "Jalisco" },
  { id: 15, key: "MEX", label: "Estado de México" },
  { id: 16, key: "MICH", label: "Michoacán" },
  { id: 17, key: "MOR", label: "Morelos" },
  { id: 18, key: "NAY", label: "Nayarit" },
  { id: 19, key: "NL", label: "Nuevo León" },
  { id: 20, key: "OAX", label: "Oaxaca" },
  { id: 21, key: "PUE", label: "Puebla" },
  { id: 22, key: "QRO", label: "Querétaro" },
  { id: 23, key: "QROO", label: "Quintana Roo" },
  { id: 24, key: "SLP", label: "San Luis Potosí" },
  { id: 25, key: "SIN", label: "Sinaloa" },
  { id: 26, key: "SON", label: "Sonora" },
  { id: 27, key: "TAB", label: "Tabasco" },
  { id: 28, key: "TAMPS", label: "Tamaulipas" },
  { id: 29, key: "TLAX", label: "Tlaxcala" },
  { id: 30, key: "VER", label: "Veracruz" },
  { id: 31, key: "YUC", label: "Yucatán" },
  { id: 32, key: "ZAC", label: "Zacatecas" },
  { id: 33, key: "PFPNNA", label: "PFPNNA" },
] as const;

export function getFederalEntityName(entityId?: number | null): string {
  if (!entityId) return "No registrada";
  return (
    FEDERAL_ENTITY_CATALOG.find((item) => item.id === entityId)?.label ??
    `Entidad federativa ${entityId}`
  );
}
