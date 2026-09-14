/**
 * Contratos vigentes de Administración de usuarios — auth_service v1.0.
 * Fuente de verdad: openapi.json y entrega técnica del backend del 06/08/2026.
 */
export interface ApiError {
  code: string;
  detail: string;
  errors?: unknown[];
  field_errors?: Record<string, string[]>;
}

export interface EstatusUsuarioRead {
  id: number;
  nombre: string;
}

export interface InstanciaRead {
  id: number;
  nombre: string;
  siglas: string;
}

export interface AccionUsuarioListRead {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export interface ModuloUsuarioListRead {
  id: string;
  nombre: string;
  descripcion?: string | null;
  acciones: AccionUsuarioListRead[];
}

export interface GrupoUsuarioListRead {
  id: string;
  nombre: string;
  descripcion?: string | null;
  /** Solo se incluye para SUPER_ADMIN en GET /users. */
  modulos?: ModuloUsuarioListRead[];
}

export interface UserListPublic {
  id: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string | null;
  correo_electronico: string;
  curp: string;
  entidad_federativa_id?: number | null;
  numero_telefono?: string | null;
  estatus?: EstatusUsuarioRead | null;
  instancia?: InstanciaRead | null;
  grupos?: GrupoUsuarioListRead[];
}

export type GetUsersResponse = UserListPublic[];

export interface AccionPermisoRead {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export interface ModuloPermisoRead {
  id: string;
  nombre: string;
  descripcion?: string | null;
  acciones: AccionPermisoRead[];
}

export interface GrupoPermisoRead {
  id: string;
  nombre: string;
  descripcion?: string | null;
  modulos: ModuloPermisoRead[];
}

export interface UserRead {
  id: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  correo_electronico: string;
  curp: string;
  entidad_federativa_id: number | null;
  numero_telefono: string | null;
  is_2fa_enabled: boolean;
  estatus: EstatusUsuarioRead | null;
  instancia: InstanciaRead | null;
  intentos_login: number;
  fecha_correo_verificado: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface UserWithPermissionsRead extends UserRead {
  permisos: { grupos: GrupoPermisoRead[] };
}

export interface CreateUserRequest {
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string | null;
  correo_electronico: string;
  curp: string;
  entidad_federativa_id: number;
  numero_telefono?: string | null;
  estatus_id?: number | null;
  instancia_id?: number | null;
  grupo_id: string;
}

export interface UpdateUserRequest {
  nombre?: string | null;
  primer_apellido?: string | null;
  segundo_apellido?: string | null;
  correo_electronico?: string | null;
  curp?: string | null;
  entidad_federativa_id?: number | null;
  numero_telefono?: string | null;
  estatus_id?: number | null;
  instancia_id?: number | null;
}

export interface AccionCatalogoRead {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export interface ModuloCatalogoRead {
  id: string;
  nombre: string;
  descripcion?: string | null;
  acciones: AccionCatalogoRead[];
}

export interface GrupoCatalogoRead {
  id: string;
  nombre: string;
  descripcion?: string | null;
  modulos: ModuloCatalogoRead[];
}

export type PermissionCatalogResponse = GrupoCatalogoRead[];

export interface AssignInitialPermissionsRequest {
  grupo_id?: string | null;
  modulo_ids?: string[];
  accion_ids?: string[];
}

export interface AssignInitialPermissionsResponse {
  message: string;
  user_id: string;
  grupos_asignados: number;
  modulos_asignados: number;
  acciones_asignadas: number;
  correo_bienvenida_enviado: boolean;
  permisos?: { grupos?: GrupoPermisoRead[] };
}

export interface AddUserGroupRequest {
  grupo_id: string;
}
export interface AddUserModuleRequest {
  modulo_id: string;
}
export interface AddUserActionRequest {
  accion_id: string;
}

export interface UsuarioGrupoRead {
  id: string;
  fecha_asignacion: string;
  grupo: { id: string; nombre: string; descripcion?: string | null };
}

export interface UsuarioModuloRead {
  id: string;
  fecha_asignacion: string;
  modulo: { id: string; nombre: string; descripcion?: string | null; grupo_id: string };
}

export interface UsuarioAccionRead {
  id: string;
  fecha_asignacion: string;
  accion: { id: string; nombre: string; descripcion?: string | null; modulo_id: string };
}

export interface AdminEmailResponse {
  message: string;
  user_id: string;
  correo_electronico: string;
}

export interface RemoveGroupResponse {
  message: string;
  user_id: string;
  grupo_id: string;
  acciones_eliminadas: number;
  modulos_eliminados: number;
  grupo_eliminado: boolean;
}

export interface RemoveModuleResponse {
  message: string;
  user_id: string;
  modulo_id: string;
  acciones_eliminadas: number;
  modulo_eliminado: boolean;
  grupo_padre_eliminado: boolean;
}

export interface RemoveActionResponse {
  message: string;
  user_id: string;
  accion_id: string;
}
