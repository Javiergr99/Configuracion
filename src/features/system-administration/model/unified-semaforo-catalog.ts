import type { PermissionCatalogGroup } from "@/features/system-administration/model/admin-user.types";

/**
 * Grupos heredados conservados en Auth por compatibilidad.
 * No deben ofrecerse para nuevas asignaciones.
 */
const LEGACY_SEMAFORO_GROUPS = new Set([
  "SEMAFORO_ADMIN",
  "SEMAFORO_DGCP",
  "SEMAFORO_DGNPDDNNA",
  "SEMAFORO_DGRCAS",
  "SEMAFORO_DGRJRDNNA",
]);

function filterLegacySemaforoGroups(
  catalog: PermissionCatalogGroup[],
): PermissionCatalogGroup[] {
  const hasCanonicalGroup = catalog.some(
    (group) => group.name.trim().toUpperCase() === "SEMAFORO",
  );

  // No ocultar catalogos inesperados si falta el canonico.
  if (!hasCanonicalGroup) return catalog;

  return catalog.filter(
    (group) =>
      !LEGACY_SEMAFORO_GROUPS.has(group.name.trim().toUpperCase()),
  );
}

export function unifiedSemaforoCatalogForDisplay(
  catalog: PermissionCatalogGroup[],
): PermissionCatalogGroup[] {
  return filterLegacySemaforoGroups(catalog);
}

export function unifiedSemaforoCatalogForNewUsers(
  catalog: PermissionCatalogGroup[],
): PermissionCatalogGroup[] {
  return filterLegacySemaforoGroups(catalog);
}
