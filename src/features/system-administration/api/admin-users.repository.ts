import type {
  AdminCurrentUser,
  AdminPermissionUpdateInput,
  AdminUser,
  AdminUserFilters,
  CreateAdminUserInput,
  CreateAdminUserResult,
  PaginatedAdminUsers,
  PermissionCatalogGroup,
  PermissionUpdateResult,
  UpdateAdminUserInput,
} from "@/features/system-administration/model/admin-user.types";

export interface AdminUsersRepository {
  listUsers(filters: AdminUserFilters): Promise<PaginatedAdminUsers>;
  getCurrentUser(): Promise<AdminCurrentUser>;
  getUser(id: string): Promise<AdminUser>;
  createUser(input: CreateAdminUserInput): Promise<CreateAdminUserResult>;
  updateUser(id: string, input: UpdateAdminUserInput): Promise<AdminUser>;
  changeStatus(id: string, statusId: number): Promise<AdminUser>;
  resendActivation(id: string): Promise<{ message: string }>;
  sendPasswordRecovery(id: string): Promise<{ message: string }>;
  getPermissionCatalog(): Promise<PermissionCatalogGroup[]>;
  updatePermissions(id: string, input: AdminPermissionUpdateInput): Promise<PermissionUpdateResult>;
}
