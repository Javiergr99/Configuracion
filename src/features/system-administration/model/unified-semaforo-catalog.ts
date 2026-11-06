import type { PermissionCatalogGroup } from "@/features/system-administration/model/admin-user.types";

/**
 * El backend publica solo el grupo canónico SEMAFORO.
 * No se ocultan grupos ni se reescriben UUID: un catálogo inesperado
 * debe permanecer visible para su auditoría, nunca maquillarse en la UI.
 */
export function unifiedSemaforoCatalogForDisplay(
  catalog: PermissionCatalogGroup[],
): PermissionCatalogGroup[] {
  return catalog;
}

export function unifiedSemaforoCatalogForNewUsers(
  catalog: PermissionCatalogGroup[],
): PermissionCatalogGroup[] {
  return catalog;
}
