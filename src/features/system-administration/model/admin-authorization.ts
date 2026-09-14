import type { AdminUser } from "@/features/system-administration/model/admin-user.types";

export function hasAdminAction(user: AdminUser | undefined, action: string): boolean {
  return Boolean(user?.permissions.includes("SUPER_ADMIN") || user?.permissions.includes(action));
}

export function isSuperAdmin(user: AdminUser | undefined): boolean {
  return Boolean(user?.permissions.includes("SUPER_ADMIN"));
}
