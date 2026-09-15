# Contrato vigente de Administración — auth_service v1.1

Este documento resume el contrato utilizado por el adaptador HTTP del frontend. No sustituye al OpenAPI entregado por backend.

## Fuente de verdad

1. `docs/contracts/auth-service-admin-v1.0/openapi.json`.
2. OpenAPI exportado desde la instancia de backend en ejecución, cuando exista una versión más reciente.
3. Schemas y matrices entregados en la misma carpeta.

## Respuestas principales

- `GET /users` → `UserListPublic[]`.
- `GET /users/me` → `UserWithPermissionsRead`.
- `GET /users/{user_id}` → `UserWithPermissionsRead`.
- `POST /users` → `UserRead`.
- `PATCH /users/{user_id}` → `UserRead`.
- `PATCH /users/{user_id}/estatus/{estatus_id}` → `UserRead`.
- `GET /users/catalogo-permisos` → `GrupoCatalogoRead[]`.
- `PATCH /users/{user_id}/permisos/delta` → actualización atómica de grupos, módulos y acciones.

## Formato de errores

```ts
interface ApiError {
  code: string;
  detail: string;
  errors?: unknown[];
  field_errors?: Record<string, string[]>;
}
```

La implementación vigente emite el error en el nivel superior, no dentro de `detail`.

## Estatus oficiales

|  ID | Nombre                    | Permite login |
| --: | ------------------------- | :-----------: |
|   1 | Activo                    |      Sí       |
|   2 | En Proceso                |      No       |
|   3 | Inactivo                  |      No       |
|   4 | Intentos en exceso sesión |      No       |

## Acciones por operación

| Operación                  | Acción requerida           |
| -------------------------- | -------------------------- |
| Listar usuarios            | `VER_USUARIOS`             |
| Ver detalle                | `VER_USUARIO_DETALLE`      |
| Crear usuario              | `CREAR_USUARIO`            |
| Editar usuario             | `ACTUALIZAR_USUARIO`       |
| Cambiar estatus            | `DESACTIVAR_USUARIO`       |
| Reenviar activación        | `ACTUALIZAR_USUARIO`       |
| Enviar recuperación        | `ACTUALIZAR_USUARIO`       |
| Asignar permisos iniciales | `ASIGNAR_ACCIONES_USUARIO` |
| Agregar grupo              | `ASIGNAR_GRUPOS_USUARIO`   |
| Agregar módulo             | `ASIGNAR_MODULOS_USUARIO`  |
| Agregar acción             | `ASIGNAR_ACCIONES_USUARIO` |
| Retirar grupo              | `QUITAR_GRUPOS_USUARIO`    |
| Retirar módulo             | `QUITAR_MODULOS_USUARIO`   |
| Retirar acción             | `QUITAR_ACCIONES_USUARIO`  |

El alcance administrativo vigente se calcula por grupos. `SUPER_ADMIN` omite el alcance ordinario; los demás actores administran grupos donde poseen `ADMINISTRAR_USUARIOS`.

## DELTA atómico de permisos

`PATCH /users/{user_id}/permisos/delta` recibe en una sola petición las altas y bajas calculadas por Configuración:

```json
{
  "grupo_ids_agregar": [],
  "grupo_ids_quitar": [],
  "modulo_ids_agregar": [],
  "modulo_ids_quitar": [],
  "accion_ids_agregar": [],
  "accion_ids_quitar": []
}
```

El backend valida el DELTA completo antes de escribir, protege `SUPER_ADMIN` y aplica los cambios dentro de una transacción. Cuando el actor modifica sus propios permisos y hubo cambios efectivos, la respuesta indica `requiere_reautenticacion=true`; el frontend finaliza la operación y fuerza una nueva autenticación.

La acción `SUPER_ADMIN` del propio usuario permanece bloqueada en la interfaz como protección adicional. La autoridad final sigue siendo `auth_service`.
