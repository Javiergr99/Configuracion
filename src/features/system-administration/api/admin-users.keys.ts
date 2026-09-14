import type { AdminUserFilters } from "@/features/system-administration/model/admin-user.types";

export const adminUsersKeys = {
  all: ["admin-users"] as const,
  lists: () => [...adminUsersKeys.all, "list"] as const,
  list: (filters: AdminUserFilters) => [...adminUsersKeys.lists(), filters] as const,
  details: () => [...adminUsersKeys.all, "detail"] as const,
  detail: (id: string) => [...adminUsersKeys.details(), id] as const,
  current: () => [...adminUsersKeys.all, "current"] as const,
  catalog: () => [...adminUsersKeys.all, "permission-catalog"] as const,
};
