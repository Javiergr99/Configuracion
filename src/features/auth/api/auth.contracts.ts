export interface ApiErrorPayload {
  code?: string;
  detail?: string | { code?: string; detail?: string } | unknown[];
  errors?: unknown[];
  field_errors?: Record<string, string[]>;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
}

export interface ExchangeCodeRequest {
  code: string;
}

export interface AuthAction {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export interface AuthModule {
  id: string;
  nombre: string;
  descripcion?: string | null;
  acciones?: AuthAction[];
}

export interface AuthGroup {
  id: string;
  nombre: string;
  descripcion?: string | null;
  modulos?: AuthModule[];
}

export interface AuthenticatedUser {
  id: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string | null;
  correo_electronico: string;
  curp: string;
  entidad_federativa_id?: number | null;
  numero_telefono?: string | null;
  is_2fa_enabled: boolean;
  estatus?: { id: number; nombre: string } | null;
  instancia?: { id: number; nombre: string; siglas: string } | null;
  intentos_login: number;
  fecha_correo_verificado?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  permisos?: {
    grupos?: AuthGroup[];
  };
}
