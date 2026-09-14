import { ADMIN_USERS_MOCK } from "@/features/system-administration/data/admin-users.mock";
import { PERMISSION_CATALOG_MOCK } from "@/features/system-administration/data/permission-catalog.mock";
import type { AdminUsersRepository } from "@/features/system-administration/api/admin-users.repository";
import { summarizeUsers } from "@/features/system-administration/model/admin-user.mapper";
import type {
  AdminPermissionGroup,
  AdminPermissionUpdateInput,
  AdminUser,
  AdminUserFilters,
  CreateAdminUserInput,
  CreateAdminUserResult,
  PaginatedAdminUsers,
  PermissionCatalogGroup,
  PermissionSelection,
  PermissionUpdateResult,
  UpdateAdminUserInput,
} from "@/features/system-administration/model/admin-user.types";
import { delay } from "@/shared/lib/delay";

let users = ADMIN_USERS_MOCK.map((user) => ({
  ...user,
}));

function contains(value: string, query: string): boolean {
  return value.toLocaleLowerCase("es-MX").includes(query.toLocaleLowerCase("es-MX"));
}

function uniqueOptions(
  entries: Array<{
    value: string;
    label: string;
  }>,
) {
  const options = new Map<string, { value: string; label: string }>();

  for (const entry of entries) {
    options.set(entry.value, entry);
  }

  return [...options.values()];
}

function permissionGroupsFromSelection(selection: PermissionSelection): AdminPermissionGroup[] {
  const selectedGroupIds = new Set(selection.groupIds);
  const selectedModuleIds = new Set(selection.moduleIds);
  const selectedActionIds = new Set(selection.actionIds);

  const permissionGroups: AdminPermissionGroup[] = [];

  for (const group of PERMISSION_CATALOG_MOCK) {
    if (!selectedGroupIds.has(group.id)) {
      continue;
    }

    const modules: AdminPermissionGroup["modules"] = [];

    for (const module of group.modules) {
      if (!selectedModuleIds.has(module.id)) {
        continue;
      }

      const actions: AdminPermissionGroup["modules"][number]["actions"] = [];

      for (const action of module.actions) {
        if (selectedActionIds.has(action.id)) {
          actions.push({
            id: action.id,
            name: action.name,
            description: action.description,
          });
        }
      }

      modules.push({
        id: module.id,
        name: module.name,
        description: module.description,
        actions,
      });
    }

    permissionGroups.push({
      id: group.id,
      name: group.name,
      description: group.description,
      modules,
    });
  }

  return permissionGroups;
}

function withPermissionGroups(user: AdminUser, selection: PermissionSelection): AdminUser {
  const permissionGroups = permissionGroupsFromSelection(selection);
  const groups: AdminUser["groups"] = [];
  const permissions: string[] = [];

  for (const group of permissionGroups) {
    groups.push({
      id: group.id,
      name: group.name,
      description: group.description,
    });

    for (const module of group.modules) {
      for (const action of module.actions) {
        permissions.push(action.name);
      }
    }
  }

  return {
    ...user,
    permissionGroups,
    groups,
    permissions,
  };
}

function actor(): AdminUser {
  const groupIds: string[] = [];
  const moduleIds: string[] = [];
  const actionIds: string[] = [];

  for (const group of PERMISSION_CATALOG_MOCK) {
    groupIds.push(group.id);

    for (const module of group.modules) {
      moduleIds.push(module.id);

      for (const action of module.actions) {
        actionIds.push(action.id);
      }
    }
  }

  return withPermissionGroups(users[0]!, {
    groupIds,
    moduleIds,
    actionIds,
  });
}

function buildMockFilterOptions(sourceUsers: AdminUser[]) {
  const instances: Array<{
    value: string;
    label: string;
  }> = [];
  const entities: Array<{
    value: string;
    label: string;
  }> = [];
  const groups: Array<{
    value: string;
    label: string;
  }> = [];

  for (const user of sourceUsers) {
    if (user.instanceId !== null) {
      instances.push({
        value: String(user.instanceId),
        label: user.instance,
      });
    }

    if (user.entityId !== null) {
      entities.push({
        value: String(user.entityId),
        label: user.entity,
      });
    }

    for (const group of user.groups) {
      groups.push({
        value: group.id,
        label: group.name,
      });
    }
  }

  return {
    instances: uniqueOptions(instances),
    entities: uniqueOptions(entities),
    groups: uniqueOptions(groups),
  };
}

function joinNameParts(parts: Array<string | undefined>): string {
  const defined: string[] = [];

  for (const part of parts) {
    if (part) defined.push(part);
  }

  return defined.join(" ");
}

function countPermissionChanges(original: PermissionSelection, next: PermissionSelection): number {
  const originalGroups = new Set(original.groupIds);
  const originalModules = new Set(original.moduleIds);
  const originalActions = new Set(original.actionIds);
  const nextGroups = new Set(next.groupIds);
  const nextModules = new Set(next.moduleIds);
  const nextActions = new Set(next.actionIds);

  let count = 0;

  for (const id of nextGroups) {
    if (!originalGroups.has(id)) count += 1;
  }
  for (const id of nextModules) {
    if (!originalModules.has(id)) count += 1;
  }
  for (const id of nextActions) {
    if (!originalActions.has(id)) count += 1;
  }
  for (const id of originalGroups) {
    if (!nextGroups.has(id)) count += 1;
  }
  for (const id of originalModules) {
    if (!nextModules.has(id)) count += 1;
  }
  for (const id of originalActions) {
    if (!nextActions.has(id)) count += 1;
  }

  return count;
}

function selectedGroups(groupIds: string[]): AdminUser["groups"] {
  const selectedGroupIds = new Set(groupIds);
  const groups: AdminUser["groups"] = [];

  for (const group of PERMISSION_CATALOG_MOCK) {
    if (!selectedGroupIds.has(group.id)) continue;

    groups.push({
      id: group.id,
      name: group.name,
      description: group.description,
    });
  }

  return groups;
}

export class MockAdminUsersRepository implements AdminUsersRepository {
  async listUsers(filters: AdminUserFilters): Promise<PaginatedAdminUsers> {
    await delay(260);

    const query = filters.search.trim();
    const filtered = users.filter((user) => {
      const matchesSearch =
        !query ||
        [user.fullName, user.curp, user.email, user.username].some((value) =>
          contains(value, query),
        );

      return (
        matchesSearch &&
        (!filters.status || user.status === filters.status) &&
        (!filters.instanceId || String(user.instanceId ?? "") === filters.instanceId) &&
        (!filters.entityId || String(user.entityId ?? "") === filters.entityId) &&
        (!filters.groupId || user.groups.some((group) => group.id === filters.groupId))
      );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize));
    const page = Math.min(filters.page, totalPages);
    const start = (page - 1) * filters.pageSize;

    return {
      items: filtered.slice(start, start + filters.pageSize),
      totalItems: filtered.length,
      totalPages,
      page,
      pageSize: filters.pageSize,
      summary: summarizeUsers(users),
      filterOptions: buildMockFilterOptions(users),
    };
  }

  async getCurrentUser(): Promise<AdminUser> {
    await delay(120);
    return actor();
  }

  async getUser(id: string): Promise<AdminUser> {
    await delay(180);

    const user = users.find((item) => item.id === id);

    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    if (user.permissionGroups.length) {
      return user;
    }

    const group = PERMISSION_CATALOG_MOCK.find((item) => item.id === user.groups[0]?.id);

    if (!group) return user;

    const userPermissions = new Set(user.permissions);
    const moduleIds: string[] = [];
    const actionIds: string[] = [];

    for (const module of group.modules) {
      moduleIds.push(module.id);

      for (const action of module.actions) {
        if (userPermissions.has(action.name)) {
          actionIds.push(action.id);
        }
      }
    }

    return withPermissionGroups(user, {
      groupIds: [group.id],
      moduleIds,
      actionIds,
    });
  }

  async createUser(input: CreateAdminUserInput): Promise<CreateAdminUserResult> {
    await delay(450);

    if (users.some((user) => user.curp === input.curp.toUpperCase())) {
      throw new Error("La CURP ya está registrada en el sistema.");
    }

    if (users.some((user) => user.email === input.email.toLowerCase())) {
      throw new Error("El correo ya está registrado en el sistema.");
    }

    const selectedGroupIds = input.groupIds.length ? input.groupIds : [input.groupId];

    const selection = {
      groupIds: selectedGroupIds,
      moduleIds: input.moduleIds,
      actionIds: input.actionIds,
    };

    const base: AdminUser = {
      id: `usr-${crypto.randomUUID()}`,
      username: input.email.split("@")[0] || input.email,
      fullName: joinNameParts([input.firstName, input.firstSurname, input.secondSurname]),
      firstName: input.firstName,
      firstSurname: input.firstSurname,
      secondSurname: input.secondSurname,
      curp: input.curp.toUpperCase(),
      email: input.email.toLowerCase(),
      phone: input.phone,
      instanceId: input.instanceId,
      instance: input.instanceId ? `Instancia ${input.instanceId}` : "Sin instancia",
      entityId: input.entityId,
      entity: `Entidad ${input.entityId}`,
      groups: selectedGroups(selectedGroupIds),
      statusId: input.statusId,
      status:
        input.statusId === 1
          ? "ACTIVO"
          : input.statusId === 2
            ? "EN_PROCESO"
            : input.statusId === 3
              ? "INACTIVO"
              : "BLOQUEADO",
      twoFactorEnabled: false,
      loginAttempts: 0,
      emailVerifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissionGroups: [],
      permissions: [],
    };

    const user = withPermissionGroups(base, selection);

    users = [user, ...users];

    return {
      user,
      permissionsAssigned: true,
      activationEmailSent: true,
    };
  }

  async updateUser(id: string, input: UpdateAdminUserInput): Promise<AdminUser> {
    const user = await this.getUser(id);

    const secondSurname =
      input.secondSurname === undefined ? user.secondSurname : (input.secondSurname ?? undefined);

    const updated: AdminUser = {
      ...user,
      firstName: input.firstName ?? user.firstName,
      firstSurname: input.firstSurname ?? user.firstSurname,
      secondSurname,
      curp: input.curp ?? user.curp,
      email: input.email ?? user.email,
      phone: input.phone === undefined ? user.phone : (input.phone ?? undefined),
      instanceId: input.instanceId === undefined ? user.instanceId : input.instanceId,
      instance:
        input.instanceId === undefined
          ? user.instance
          : input.instanceId
            ? `Instancia ${input.instanceId}`
            : "Sin instancia",
      entityId: input.entityId === undefined ? user.entityId : input.entityId,
      entity:
        input.entityId === undefined
          ? user.entity
          : input.entityId
            ? `Entidad ${input.entityId}`
            : "Sin entidad",
      updatedAt: new Date().toISOString(),
      fullName: joinNameParts([
        input.firstName ?? user.firstName,
        input.firstSurname ?? user.firstSurname,
        secondSurname,
      ]),
    };

    users = users.map((item) => (item.id === id ? updated : item));

    return updated;
  }

  async changeStatus(id: string, statusId: number): Promise<AdminUser> {
    const user = await this.getUser(id);

    const status: AdminUser["status"] =
      statusId === 1
        ? "ACTIVO"
        : statusId === 2
          ? "EN_PROCESO"
          : statusId === 3
            ? "INACTIVO"
            : "BLOQUEADO";

    const updated: AdminUser = {
      ...user,
      statusId,
      status,
      loginAttempts: statusId === 1 ? 0 : user.loginAttempts,
      updatedAt: new Date().toISOString(),
    };

    users = users.map((item) => (item.id === id ? updated : item));

    return updated;
  }

  async resendActivation(id: string): Promise<{ message: string }> {
    await this.getUser(id);

    return {
      message: "Correo de activación reenviado correctamente.",
    };
  }

  async sendPasswordRecovery(id: string): Promise<{ message: string }> {
    await this.getUser(id);

    return {
      message: "Correo de recuperación de contraseña enviado correctamente.",
    };
  }

  async getPermissionCatalog(): Promise<PermissionCatalogGroup[]> {
    await delay(140);
    return PERMISSION_CATALOG_MOCK;
  }

  async updatePermissions(
    id: string,
    input: AdminPermissionUpdateInput,
  ): Promise<PermissionUpdateResult> {
    await delay(320);

    const user = await this.getUser(id);
    const updated = withPermissionGroups(user, input.next);

    users = users.map((item) => (item.id === id ? updated : item));

    return {
      user: updated,
      complete: true,
      completedOperations: countPermissionChanges(input.original, input.next),
    };
  }
}
