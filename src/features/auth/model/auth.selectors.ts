import type { AuthenticatedUser } from "@/features/auth/api/auth.contracts";

function normalize(value?: string | null): string {
  return value?.trim().toUpperCase() ?? "";
}

export function getUserActionNames(user?: AuthenticatedUser | null): string[] {
  const actions =
    user?.permisos?.grupos?.flatMap((group) =>
      (group.modulos ?? []).flatMap((module) =>
        (module.acciones ?? []).map((action) => normalize(action.nombre)),
      ),
    ) ?? [];

  return [...new Set(actions.filter(Boolean))];
}

export function userHasAction(user: AuthenticatedUser | null | undefined, action: string): boolean {
  const actions = new Set(getUserActionNames(user));
  return actions.has("SUPER_ADMIN") || actions.has(normalize(action));
}

export function userHasExactAction(
  user: AuthenticatedUser | null | undefined,
  action: string,
): boolean {
  return getUserActionNames(user).includes(normalize(action));
}

export function isSuperAdmin(user?: AuthenticatedUser | null): boolean {
  return getUserActionNames(user).includes("SUPER_ADMIN");
}

export function getUserDisplayName(user?: AuthenticatedUser | null): string {
  if (!user) return "Usuario";
  return [user.nombre, user.primer_apellido, user.segundo_apellido].filter(Boolean).join(" ");
}

export function getUserInitials(user?: AuthenticatedUser | null): string {
  if (!user) return "US";
  return `${user.nombre?.[0] ?? ""}${user.primer_apellido?.[0] ?? ""}`.toUpperCase().slice(0, 2);
}

export function getUserRoleLabel(user?: AuthenticatedUser | null): string {
  if (isSuperAdmin(user)) return "Superadministrador";
  if (userHasAction(user, "ADMINISTRAR_USUARIOS")) return "Administrador";
  return user?.instancia?.siglas ?? "Usuario";
}
