import type { PermissionCatalogGroup } from "@/features/system-administration/model/admin-user.types";

export const PERMISSION_CATALOG_MOCK: PermissionCatalogGroup[] = [
  {
    id: "grp-mesa-ayuda",
    name: "MESA_AYUDA",
    description: "Sistema de Mesa de Ayuda y control de atenciones.",
    assignable: true,
    modules: [
      {
        id: "mod-bitacora",
        name: "BITACORA_ATENCIONES",
        description: "Registro y consulta de atenciones.",
        assignable: true,
        actions: [
          { id: "act-ver-bitacora", name: "VER_BITACORA", assignable: true },
          { id: "act-crear-bitacora", name: "CREAR_BITACORA", assignable: true },
          { id: "act-actualizar-bitacora", name: "ACTUALIZAR_BITACORA", assignable: true },
        ],
      },
      {
        id: "mod-usuarios",
        name: "ADMINISTRACION_USUARIOS",
        description: "Administración de usuarios y asignación de accesos.",
        assignable: true,
        actions: [
          { id: "act-administrar-usuarios", name: "ADMINISTRAR_USUARIOS", assignable: true },
          { id: "act-ver-usuarios", name: "VER_USUARIOS", assignable: true },
          { id: "act-ver-usuario-detalle", name: "VER_USUARIO_DETALLE", assignable: true },
          { id: "act-crear-usuario", name: "CREAR_USUARIO", assignable: true },
          { id: "act-actualizar-usuario", name: "ACTUALIZAR_USUARIO", assignable: true },
          { id: "act-asignar-grupos", name: "ASIGNAR_GRUPOS_USUARIO", assignable: true },
          { id: "act-asignar-modulos", name: "ASIGNAR_MODULOS_USUARIO", assignable: true },
          { id: "act-asignar-acciones", name: "ASIGNAR_ACCIONES_USUARIO", assignable: true },
          { id: "act-quitar-grupos", name: "QUITAR_GRUPOS_USUARIO", assignable: true },
          { id: "act-quitar-modulos", name: "QUITAR_MODULOS_USUARIO", assignable: true },
          { id: "act-quitar-acciones", name: "QUITAR_ACCIONES_USUARIO", assignable: true },
          {
            id: "act-super-admin",
            name: "SUPER_ADMIN",
            assignable: false,
            description: "Acción protegida de alto privilegio.",
          },
        ],
      },
    ],
  },
  {
    id: "grp-formatos",
    name: "FORMATOS_ATENCIONES",
    description: "Captura, validación y reportes de formatos de atención.",
    assignable: true,
    modules: [
      {
        id: "mod-captura-formatos",
        name: "CAPTURA_FORMATOS",
        assignable: true,
        actions: [
          { id: "act-capturar-formato", name: "CAPTURAR_FORMATO_ATENCIONES", assignable: true },
          { id: "act-ver-mis-formatos", name: "VER_MIS_FORMATOS_ATENCIONES", assignable: true },
          { id: "act-actualizar-devuelto", name: "ACTUALIZAR_FORMATO_DEVUELTO", assignable: true },
        ],
      },
      {
        id: "mod-gestion-formatos",
        name: "GESTION_FORMATOS",
        assignable: true,
        actions: [
          { id: "act-ver-recibidos", name: "VER_FORMATOS_RECIBIDOS", assignable: true },
          { id: "act-iniciar-revision", name: "INICIAR_REVISION_FORMATO", assignable: true },
          { id: "act-validar-formato", name: "VALIDAR_FORMATO_ATENCIONES", assignable: true },
        ],
      },
    ],
  },
];
