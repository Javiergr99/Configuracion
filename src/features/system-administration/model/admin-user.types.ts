export type AdminUserStatus = "ACTIVO" | "EN_PROCESO" | "INACTIVO" | "BLOQUEADO" | "SIN_ESTATUS";

export type AdminPermissionAction = { id: string; name: string; description?: string };
export type AdminPermissionModule = {
  id: string;
  name: string;
  description?: string;
  actions: AdminPermissionAction[];
};
export type AdminPermissionGroup = {
  id: string;
  name: string;
  description?: string;
  modules: AdminPermissionModule[];
};

export type AdminUser = {
  id: string;
  username: string;
  fullName: string;
  firstName: string;
  firstSurname: string;
  secondSurname?: string;
  curp: string;
  email: string;
  phone?: string;
  instanceId: number | null;
  instance: string;
  entityId: number | null;
  entity: string;
  groups: Array<{ id: string; name: string; description?: string }>;
  statusId: number | null;
  status: AdminUserStatus;
  twoFactorEnabled?: boolean;
  loginAttempts?: number;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  permissionGroups: AdminPermissionGroup[];
  permissions: string[];
};

export type AdminUsersSummary = {
  total: number;
  active: number;
  inProcess: number;
  inactive: number;
  blocked: number;
};

export type AdminUserFilters = {
  search: string;
  status: AdminUserStatus | "";
  instanceId: string;
  entityId: string;
  groupId: string;
  page: number;
  pageSize: number;
};

export type AdminSelectOption = { value: string; label: string };
export type AdminUserFilterOptions = {
  instances: AdminSelectOption[];
  entities: AdminSelectOption[];
  groups: AdminSelectOption[];
};

export type PaginatedAdminUsers = {
  items: AdminUser[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
  summary: AdminUsersSummary;
  filterOptions: AdminUserFilterOptions;
};

export type PermissionCatalogAction = {
  id: string;
  name: string;
  description?: string;
  assignable: boolean;
};
export type PermissionCatalogModule = {
  id: string;
  name: string;
  description?: string;
  assignable: boolean;
  actions: PermissionCatalogAction[];
};
export type PermissionCatalogGroup = {
  id: string;
  name: string;
  description?: string;
  assignable: boolean;
  modules: PermissionCatalogModule[];
};

export type PermissionSelection = {
  groupIds: string[];
  moduleIds: string[];
  actionIds: string[];
};

export type CreateAdminUserInput = {
  firstName: string;
  firstSurname: string;
  secondSurname?: string;
  curp: string;
  email: string;
  phone?: string;
  instanceId: number | null;
  entityId: number;
  statusId: number | null;
  groupId: string;
  /** Selección completa del asistente. groupId permanece como grupo primario requerido por POST /users. */
  groupIds: string[];
  moduleIds: string[];
  actionIds: string[];
};

export type CreateAdminUserResult = {
  user: AdminUser;
  permissionsAssigned: boolean;
  activationEmailSent: boolean;
  warning?: string;
  groupsAssigned?: number;
  modulesAssigned?: number;
  actionsAssigned?: number;
};

export type UpdateAdminUserInput = {
  firstName?: string;
  firstSurname?: string;
  secondSurname?: string | null;
  curp?: string;
  email?: string;
  phone?: string | null;
  instanceId?: number | null;
  entityId?: number | null;
};

export type AdminPermissionUpdateInput = {
  original: PermissionSelection;
  next: PermissionSelection;
};

export type PermissionUpdateResult = {
  user: AdminUser;
  complete: boolean;
  completedOperations: number;
  warning?: string;
};

export type AdminCurrentUser = AdminUser;

export const ADMIN_STATUS_CATALOG = [
  { id: 1, name: "Activo", status: "ACTIVO" as const, allowsLogin: true },
  { id: 2, name: "En Proceso", status: "EN_PROCESO" as const, allowsLogin: false },
  { id: 3, name: "Inactivo", status: "INACTIVO" as const, allowsLogin: false },
  { id: 4, name: "Intentos en exceso sesión", status: "BLOQUEADO" as const, allowsLogin: false },
] as const;
