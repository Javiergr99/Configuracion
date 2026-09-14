import type {
  AddUserActionRequest,
  AddUserGroupRequest,
  AddUserModuleRequest,
  AdminEmailResponse,
  AssignInitialPermissionsRequest,
  AssignInitialPermissionsResponse,
  CreateUserRequest,
  GetUsersResponse,
  PermissionCatalogResponse,
  UpdateUserRequest,
  UserRead,
  UserWithPermissionsRead,
} from "@/features/system-administration/api/admin-users.contracts";
import { AdminApiError } from "@/features/system-administration/api/admin-api-error";
import { AuthApiError, authRequest } from "@/features/auth/api/auth-client";
import type { AdminUsersRepository } from "@/features/system-administration/api/admin-users.repository";
import {
  mapAdminUserDetail,
  mapAdminUserListItem,
  mapPermissionCatalog,
  mapUserRead,
  summarizeUsers,
} from "@/features/system-administration/model/admin-user.mapper";
import {
  buildPermissionOperationPlan,
  getPermissionParentMaps,
  permissionOperationSequence,
  type PermissionOperationStep,
} from "@/features/system-administration/model/permission-operation-plan";
import { buildInitialPermissionAssignmentPlan } from "@/features/system-administration/model/initial-permission-assignment";
import {
  formatScopedPermissionRequirement,
  missingScopedRequirementsForInitialPermissionPlan,
  missingScopedRequirementsForPermissionPlan,
} from "@/features/system-administration/model/permission-scope";
import { getPermissionGroupDisplayLabel } from "@/features/system-administration/model/system-access-presentation";
import type {
  AdminPermissionUpdateInput,
  AdminSelectOption,
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await authRequest<T>(path, init);
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw new AdminApiError(error.status, {
        code: error.code,
        detail: error.message,
        field_errors: error.fieldErrors,
      });
    }

    throw error;
  }
}

async function assignAdditionalGroupsSequentially(
  userId: string,
  groupIds: string[],
  index = 0,
): Promise<void> {
  const groupId = groupIds[index];
  if (!groupId) return;

  await request(`/users/${userId}/grupos`, {
    method: "POST",
    body: JSON.stringify({
      grupo_id: groupId,
    } satisfies AddUserGroupRequest),
  });

  await assignAdditionalGroupsSequentially(userId, groupIds, index + 1);
}

function contains(value: string, query: string): boolean {
  return value.toLocaleLowerCase("es-MX").includes(query.toLocaleLowerCase("es-MX"));
}

function sortedOptions(options: Map<string, AdminSelectOption>): AdminSelectOption[] {
  return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, "es-MX"));
}

function buildFilterOptions(allUsers: AdminUser[]): PaginatedAdminUsers["filterOptions"] {
  const instances = new Map<string, AdminSelectOption>();
  const entities = new Map<string, AdminSelectOption>();
  const groups = new Map<string, AdminSelectOption>();

  for (const user of allUsers) {
    if (user.instanceId !== null) {
      const value = String(user.instanceId);
      instances.set(value, {
        value,
        label: user.instance,
      });
    }

    if (user.entityId !== null) {
      const value = String(user.entityId);
      entities.set(value, {
        value,
        label: user.entity,
      });
    }

    for (const group of user.groups) {
      groups.set(group.id, {
        value: group.id,
        label: getPermissionGroupDisplayLabel(group.name),
      });
    }
  }

  return {
    instances: sortedOptions(instances),
    entities: sortedOptions(entities),
    groups: sortedOptions(groups),
  };
}

function paginateAndFilter(allUsers: AdminUser[], filters: AdminUserFilters): PaginatedAdminUsers {
  const query = filters.search.trim();

  const filtered = allUsers.filter((user) => {
    const matchesSearch =
      !query ||
      [user.fullName, user.curp, user.email, user.username].some((value) => contains(value, query));

    return (
      matchesSearch &&
      (!filters.status || user.status === filters.status) &&
      (!filters.instanceId || String(user.instanceId ?? "") === filters.instanceId) &&
      (!filters.entityId || String(user.entityId ?? "") === filters.entityId) &&
      (!filters.groupId || user.groups.some((group) => group.id === filters.groupId))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const start = (page - 1) * filters.pageSize;

  return {
    items: filtered.slice(start, start + filters.pageSize),
    totalItems: filtered.length,
    totalPages,
    page,
    pageSize: filters.pageSize,
    summary: summarizeUsers(allUsers),
    filterOptions: buildFilterOptions(allUsers),
  };
}

function createRequest(input: CreateAdminUserInput): CreateUserRequest {
  return {
    nombre: input.firstName.trim(),
    primer_apellido: input.firstSurname.trim(),
    segundo_apellido: input.secondSurname?.trim() || null,
    correo_electronico: input.email.trim().toLowerCase(),
    curp: input.curp.trim().toUpperCase(),
    entidad_federativa_id: input.entityId,
    numero_telefono: input.phone?.trim() || null,
    estatus_id: input.statusId,
    instancia_id: input.instanceId,
    grupo_id: input.groupId,
  };
}

function updateRequest(input: UpdateAdminUserInput): UpdateUserRequest {
  const body: UpdateUserRequest = {};

  if (input.firstName !== undefined) {
    body.nombre = input.firstName.trim();
  }
  if (input.firstSurname !== undefined) {
    body.primer_apellido = input.firstSurname.trim();
  }
  if (input.secondSurname !== undefined) {
    body.segundo_apellido = input.secondSurname?.trim() || null;
  }
  if (input.email !== undefined) {
    body.correo_electronico = input.email.trim().toLowerCase();
  }
  if (input.curp !== undefined) {
    body.curp = input.curp.trim().toUpperCase();
  }
  if (input.entityId !== undefined) {
    body.entidad_federativa_id = input.entityId;
  }
  if (input.phone !== undefined) {
    body.numero_telefono = input.phone?.trim() || null;
  }
  if (input.instanceId !== undefined) {
    body.instancia_id = input.instanceId;
  }

  return body;
}

type SequentialTask = () => Promise<unknown>;

/**
 * Ejecuta tareas en el mismo orden en que fueron registradas.
 *
 * La cadena de promesas mantiene la semántica secuencial del contrato
 * administrativo: si una operación falla, las siguientes no se ejecutan.
 */
function runSequentialTasks(tasks: SequentialTask[], onCompleted: () => void): Promise<void> {
  return tasks.reduce<Promise<void>>(
    (chain, task) =>
      chain
        .then(() => task())
        .then(() => {
          onCompleted();
        }),
    Promise.resolve(),
  );
}

function taskForPermissionStep(id: string, step: PermissionOperationStep): SequentialTask {
  switch (step.kind) {
    case "groupsToAdd":
      return () =>
        request(`/users/${id}/grupos`, {
          method: "POST",
          body: JSON.stringify({
            grupo_id: step.id,
          } satisfies AddUserGroupRequest),
        });

    case "modulesToAdd":
      return () =>
        request(`/users/${id}/modulos`, {
          method: "POST",
          body: JSON.stringify({
            modulo_id: step.id,
          } satisfies AddUserModuleRequest),
        });

    case "actionsToAdd":
      return () =>
        request(`/users/${id}/acciones`, {
          method: "POST",
          body: JSON.stringify({
            accion_id: step.id,
          } satisfies AddUserActionRequest),
        });

    case "actionsToRemove":
      return () => request(`/users/${id}/acciones/${step.id}`, { method: "DELETE" });

    case "modulesToRemove":
      return () => request(`/users/${id}/modulos/${step.id}`, { method: "DELETE" });

    case "groupsToRemove":
      return () => request(`/users/${id}/grupos/${step.id}`, { method: "DELETE" });
  }
}

function buildPermissionTasks(id: string, plan: Parameters<typeof permissionOperationSequence>[0]) {
  return permissionOperationSequence(plan).map((step) => taskForPermissionStep(id, step));
}

export class HttpAdminUsersRepository implements AdminUsersRepository {
  async listUsers(filters: AdminUserFilters): Promise<PaginatedAdminUsers> {
    const response = await request<GetUsersResponse>("/users");

    return paginateAndFilter(response.map(mapAdminUserListItem), filters);
  }

  async getCurrentUser(): Promise<AdminUser> {
    return mapAdminUserDetail(await request<UserWithPermissionsRead>("/users/me"));
  }

  async getUser(id: string): Promise<AdminUser> {
    return mapAdminUserDetail(await request<UserWithPermissionsRead>(`/users/${id}`));
  }

  async createUser(input: CreateAdminUserInput): Promise<CreateAdminUserResult> {
    // El catálogo se consulta antes de crear la identidad para construir una
    // asignación inicial compatible con grupos pertenecientes a varios sistemas.
    const catalog = await this.getPermissionCatalog();
    const initialPlan = buildInitialPermissionAssignmentPlan(
      {
        groupIds: input.groupIds,
        moduleIds: input.moduleIds,
        actionIds: input.actionIds,
      },
      catalog,
    );
    const actor = await this.getCurrentUser();
    const missingRequirements = missingScopedRequirementsForInitialPermissionPlan(
      initialPlan,
      catalog,
      actor,
    );

    if (missingRequirements.length) {
      throw new AdminApiError(403, {
        code: "FRONTEND_PERMISSION_SCOPE_GUARD",
        detail: `No tienes autorización suficiente para crear este acceso: ${missingRequirements
          .map(formatScopedPermissionRequirement)
          .join(", ")}.`,
      });
    }

    const created = await request<UserRead>("/users", {
      method: "POST",
      body: JSON.stringify(
        createRequest({
          ...input,
          groupId: initialPlan.primaryGroupId,
        }),
      ),
    });

    let permissionsAssigned = false;
    let activationEmailSent = false;
    let warning: string | undefined;
    let groupsAssigned: number | undefined;
    let modulesAssigned: number | undefined;
    let actionsAssigned: number | undefined;

    const permissionBody: AssignInitialPermissionsRequest = initialPlan.bulkRequest;

    try {
      // Una sola asignación masiva dispara el flujo de activación. Cuando hay
      // módulos/acciones de varios grupos se envía grupo_id=null para que
      // auth_service infiera cada grupo padre, tal como define su OpenAPI.
      const assigned = await request<AssignInitialPermissionsResponse>(
        `/users/${created.id}/permisos`,
        {
          method: "POST",
          body: JSON.stringify(permissionBody),
        },
      );

      activationEmailSent = Boolean(assigned.correo_bienvenida_enviado);
      groupsAssigned = assigned.grupos_asignados;
      modulesAssigned = assigned.modulos_asignados;
      actionsAssigned = assigned.acciones_asignadas;

      // Los grupos seleccionados sin módulos ni acciones no pueden inferirse
      // desde /permisos. Se agregan mediante el endpoint oficial de grupo.
      await assignAdditionalGroupsSequentially(created.id, initialPlan.additionalGroupIds);
      groupsAssigned = (groupsAssigned ?? 0) + initialPlan.additionalGroupIds.length;

      permissionsAssigned = true;

      if (!activationEmailSent) {
        warning =
          "El usuario y sus accesos se guardaron, pero auth_service no confirmó el envío del correo de activación.";
      }
    } catch (error) {
      warning =
        error instanceof Error
          ? `El usuario fue creado, pero la asignación inicial de accesos no se completó: ${error.message}`
          : "El usuario fue creado, pero la asignación inicial de accesos no se completó.";
    }

    const user = await this.getUser(created.id).catch(() => mapUserRead(created));

    return {
      user,
      permissionsAssigned,
      activationEmailSent,
      warning,
      groupsAssigned,
      modulesAssigned,
      actionsAssigned,
    };
  }

  async updateUser(id: string, input: UpdateAdminUserInput): Promise<AdminUser> {
    await request<UserRead>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updateRequest(input)),
    });

    return this.getUser(id);
  }

  async changeStatus(id: string, statusId: number): Promise<AdminUser> {
    await request<UserRead>(`/users/${id}/estatus/${statusId}`, { method: "PATCH" });

    return this.getUser(id);
  }

  async resendActivation(id: string): Promise<{ message: string }> {
    const response = await request<AdminEmailResponse>(`/users/${id}/reenviar-activacion`, {
      method: "POST",
    });

    return {
      message: response.message,
    };
  }

  async sendPasswordRecovery(id: string): Promise<{ message: string }> {
    const response = await request<AdminEmailResponse>(
      `/users/${id}/enviar-recuperacion-password`,
      { method: "POST" },
    );

    return {
      message: response.message,
    };
  }

  async getPermissionCatalog(): Promise<PermissionCatalogGroup[]> {
    return mapPermissionCatalog(
      await request<PermissionCatalogResponse>("/users/catalogo-permisos"),
    );
  }

  async updatePermissions(
    id: string,
    input: AdminPermissionUpdateInput,
  ): Promise<PermissionUpdateResult> {
    const catalog = await this.getPermissionCatalog();
    const actor = await this.getCurrentUser();

    if (actor.id === id) {
      throw new AdminApiError(409, {
        code: "FRONTEND_SELF_PERMISSION_GUARD",
        detail:
          "No puedes modificar tus propios accesos desde Configuración. Usa otra cuenta administrativa autorizada.",
      });
    }

    const maps = getPermissionParentMaps(catalog);

    const protectedSuperAdminIds = input.original.actionIds.filter(
      (actionId) => maps.actionName.get(actionId) === "SUPER_ADMIN",
    );

    const nextGroupIds = new Set(input.next.groupIds);
    const nextModuleIds = new Set(input.next.moduleIds);
    const nextActionIds = new Set([...input.next.actionIds, ...protectedSuperAdminIds]);

    for (const actionId of protectedSuperAdminIds) {
      const moduleId = maps.actionToModule.get(actionId);
      const groupId = maps.actionToGroup.get(actionId);

      if (moduleId) {
        nextModuleIds.add(moduleId);
      }
      if (groupId) {
        nextGroupIds.add(groupId);
      }
    }

    const next: PermissionSelection = {
      groupIds: [...nextGroupIds],
      moduleIds: [...nextModuleIds],
      actionIds: [...nextActionIds],
    };

    const plan = buildPermissionOperationPlan(input.original, next, catalog);

    const missingRequirements = missingScopedRequirementsForPermissionPlan(plan, catalog, actor);

    if (missingRequirements.length) {
      throw new AdminApiError(403, {
        code: "FRONTEND_PERMISSION_SCOPE_GUARD",
        detail: `No tienes autorización suficiente para aplicar estos cambios: ${missingRequirements
          .map(formatScopedPermissionRequirement)
          .join(", ")}.`,
      });
    }

    const tasks = buildPermissionTasks(id, plan);

    let completedOperations = 0;

    try {
      await runSequentialTasks(tasks, () => {
        completedOperations += 1;
      });

      return {
        user: await this.getUser(id),
        complete: true,
        completedOperations,
      };
    } catch (error) {
      const user = await this.getUser(id);

      return {
        user,
        complete: false,
        completedOperations,
        warning:
          error instanceof Error
            ? `La actualización se detuvo después de ${completedOperations} operación(es): ${error.message}`
            : "La actualización se detuvo y se recargó el estado real del servidor.",
      };
    }
  }
}
