import type { AdminUser } from "@/features/system-administration/model/admin-user.types";

export function hasAdminAction(user: AdminUser | undefined, action: string): boolean {
  return Boolean(user?.permissions.includes("SUPER_ADMIN") || user?.permissions.includes(action));
}

export function isSuperAdmin(user: AdminUser | undefined): boolean {
  return Boolean(user?.permissions.includes("SUPER_ADMIN"));
}

export function getAdminUserSecurityCapabilities(
  actor: AdminUser | undefined,
  target: AdminUser | undefined,
) {
  const canUpdateUser = hasAdminAction(actor, "ACTUALIZAR_USUARIO");
  const targetIsSuperAdmin = isSuperAdmin(target);
  const targetIsCurrentUser = Boolean(actor && target && actor.id === target.id);

  return {
    canEdit: canUpdateUser && !targetIsSuperAdmin && !targetIsCurrentUser,
    canSendPasswordRecovery: canUpdateUser,
  };
}
