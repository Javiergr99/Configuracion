# Módulo de Administración de usuarios

Implementación del frame Figma `admin-usuarios-listado` integrada al frontend independiente de
Configuración del Ecosistema Integral DGCP.

## Fuente contractual

El módulo consume únicamente estructuras publicadas por `auth_service`.
Los snapshots entregados por backend se conservan en:

```text
docs/contracts/auth-service-admin-v1.0/
```

Ante diferencias, el OpenAPI de la instancia vigente del backend tiene
prioridad.

## Rutas

- `/app/usuarios`
- `/app/usuarios/nuevo`
- `/app/usuarios/:userId/editar`
- `/app/historial`

## Capacidades

- listado, búsqueda, filtros, métricas y paginación;
- detalle;
- creación;
- edición;
- cambio de estatus;
- reenvío de activación;
- recuperación de contraseña;
- catálogo Grupo → Módulo → Acción;
- sincronización incremental de permisos.

## Alta

1. `POST /users` crea la cuenta.
2. `POST /users/{id}/permisos` completa la asignación inicial.

Si la segunda operación falla, la cuenta creada no se duplica. La interfaz
informa el estado parcial.

## Sincronización de permisos

El plan mantiene el orden definido por contrato:

1. grupos a agregar;
2. módulos a agregar;
3. acciones a agregar;
4. acciones a retirar;
5. módulos a retirar;
6. grupos a retirar.

Las operaciones se ejecutan secuencialmente. Ante un fallo parcial se detiene
la secuencia y se vuelve a consultar el usuario real.

Agregar una acción conserva su módulo/grupo padre; retirar un padre conserva la
coherencia de sus descendientes.

## SUPER_ADMIN

- Un administrador ordinario no puede seleccionar `SUPER_ADMIN`.
- Un actor autorizado puede asignarlo conforme al contrato.
- Operaciones críticas sobre asignaciones existentes permanecen protegidas
  mientras backend no publique garantías adicionales para el último
  superadministrador/autorretiro.

## Autenticación

Todas las rutas administrativas protegidas reciben:

```http
Authorization: Bearer <access_token>
```

El access token **no se busca en Web Storage**. Vive únicamente en memoria
durante la sesión del frontend. El refresh token permanece en cookie HttpOnly y
se utiliza exclusivamente a través de `auth_service`.

## Funciones aún no publicadas por backend

Las capacidades no disponibles se mantienen en:

[`roadmap/REQUERIMIENTOS_FUTUROS_ADMIN.md`](roadmap/REQUERIMIENTOS_FUTUROS_ADMIN.md)

No deben simularse en integración real.
