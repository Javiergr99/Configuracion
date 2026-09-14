import type {
  GrupoCatalogoRead,
  GrupoPermisoRead,
  UserListPublic,
  UserRead,
  UserWithPermissionsRead,
} from "@/features/system-administration/api/admin-users.contracts";
import { getFederalEntityName } from "@/shared/catalogs/federal-entities";
import type {
  AdminPermissionGroup,
  AdminUser,
  AdminUserStatus,
  AdminUsersSummary,
  PermissionCatalogGroup,
  PermissionSelection,
} from "@/features/system-administration/model/admin-user.types";

export function mapStatusById(id?: number | null): AdminUserStatus {
  if (id === 1) return "ACTIVO";
  if (id === 2) return "EN_PROCESO";
  if (id === 3) return "INACTIVO";
  if (id === 4) return "BLOQUEADO";
  return "SIN_ESTATUS";
}

function fullName(
  dto: Pick<UserListPublic, "nombre" | "primer_apellido" | "segundo_apellido">,
): string {
  return [dto.nombre, dto.primer_apellido, dto.segundo_apellido].filter(Boolean).join(" ");
}

function mapPermissionGroups(groups: GrupoPermisoRead[] = []): AdminPermissionGroup[] {
  return groups.map((group) => ({
    id: group.id,
    name: group.nombre,
    description: group.descripcion ?? undefined,
    modules: group.modulos.map((module) => ({
      id: module.id,
      name: module.nombre,
      description: module.descripcion ?? undefined,
      actions: module.acciones.map((action) => ({
        id: action.id,
        name: action.nombre,
        description: action.descripcion ?? undefined,
      })),
    })),
  }));
}

function flattenActions(groups: AdminPermissionGroup[]): string[] {
  return groups.flatMap((group) =>
    group.modules.flatMap((module) => module.actions.map((action) => action.name)),
  );
}

export function mapAdminUserListItem(dto: UserListPublic): AdminUser {
  const permissionGroups: AdminPermissionGroup[] = (dto.grupos ?? []).map((group) => ({
    id: group.id,
    name: group.nombre,
    description: group.descripcion ?? undefined,
    modules: (group.modulos ?? []).map((module) => ({
      id: module.id,
      name: module.nombre,
      description: module.descripcion ?? undefined,
      actions: module.acciones.map((action) => ({
        id: action.id,
        name: action.nombre,
        description: action.descripcion ?? undefined,
      })),
    })),
  }));
  return {
    id: dto.id,
    username: dto.correo_electronico.split("@")[0] || dto.id,
    fullName: fullName(dto),
    firstName: dto.nombre,
    firstSurname: dto.primer_apellido,
    secondSurname: dto.segundo_apellido ?? undefined,
    curp: dto.curp,
    email: dto.correo_electronico,
    phone: dto.numero_telefono ?? undefined,
    instanceId: dto.instancia?.id ?? null,
    instance: dto.instancia?.siglas ?? dto.instancia?.nombre ?? "Sin instancia",
    entityId: dto.entidad_federativa_id ?? null,
    entity: dto.entidad_federativa_id
      ? getFederalEntityName(dto.entidad_federativa_id)
      : "Sin entidad",
    groups: (dto.grupos ?? []).map((group) => ({
      id: group.id,
      name: group.nombre,
      description: group.descripcion ?? undefined,
    })),
    statusId: dto.estatus?.id ?? null,
    status: mapStatusById(dto.estatus?.id),
    permissionGroups,
    permissions: flattenActions(permissionGroups),
  };
}

export function mapAdminUserDetail(dto: UserWithPermissionsRead): AdminUser {
  const permissionGroups = mapPermissionGroups(dto.permisos?.grupos ?? []);
  return {
    id: dto.id,
    username: dto.correo_electronico.split("@")[0] || dto.id,
    fullName: fullName(dto),
    firstName: dto.nombre,
    firstSurname: dto.primer_apellido,
    secondSurname: dto.segundo_apellido ?? undefined,
    curp: dto.curp,
    email: dto.correo_electronico,
    phone: dto.numero_telefono ?? undefined,
    instanceId: dto.instancia?.id ?? null,
    instance: dto.instancia?.siglas ?? dto.instancia?.nombre ?? "Sin instancia",
    entityId: dto.entidad_federativa_id,
    entity: dto.entidad_federativa_id
      ? getFederalEntityName(dto.entidad_federativa_id)
      : "Sin entidad",
    groups: permissionGroups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
    })),
    statusId: dto.estatus?.id ?? null,
    status: mapStatusById(dto.estatus?.id),
    twoFactorEnabled: dto.is_2fa_enabled,
    loginAttempts: dto.intentos_login,
    emailVerifiedAt: dto.fecha_correo_verificado,
    createdAt: dto.fecha_creacion,
    updatedAt: dto.fecha_actualizacion,
    permissionGroups,
    permissions: flattenActions(permissionGroups),
  };
}

export function mapUserRead(dto: UserRead): AdminUser {
  return mapAdminUserDetail({ ...dto, permisos: { grupos: [] } });
}

export function mapPermissionCatalog(groups: GrupoCatalogoRead[]): PermissionCatalogGroup[] {
  return groups.map((group) => ({
    id: group.id,
    name: group.nombre,
    description: group.descripcion ?? undefined,
    assignable: true,
    modules: group.modulos.map((module) => ({
      id: module.id,
      name: module.nombre,
      description: module.descripcion ?? undefined,
      assignable: true,
      actions: module.acciones.map((action) => ({
        id: action.id,
        name: action.nombre,
        description: action.descripcion ?? undefined,
        // El catálogo vigente no publica assignable. La autorización de SUPER_ADMIN
        // se deriva del usuario autenticado en la capa de presentación y el backend
        // vuelve a validarla en cada operación.
        assignable: true,
      })),
    })),
  }));
}

export function selectionFromUser(user: AdminUser): PermissionSelection {
  return {
    groupIds: user.permissionGroups.map((group) => group.id),
    moduleIds: user.permissionGroups.flatMap((group) => group.modules.map((module) => module.id)),
    actionIds: user.permissionGroups.flatMap((group) =>
      group.modules.flatMap((module) => module.actions.map((action) => action.id)),
    ),
  };
}

export function summarizeUsers(users: AdminUser[]): AdminUsersSummary {
  return {
    total: users.length,
    active: users.filter((user) => user.status === "ACTIVO").length,
    inProcess: users.filter((user) => user.status === "EN_PROCESO").length,
    inactive: users.filter((user) => user.status === "INACTIVO" || user.status === "SIN_ESTATUS")
      .length,
    blocked: users.filter((user) => user.status === "BLOQUEADO").length,
  };
}
