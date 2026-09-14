# Integración backend pendiente — Perfiles

## Contrato disponible hoy

El snapshot de `auth_service` incluido en:

```text
docs/contracts/auth-service-admin-v1.0/
```

permite administrar permisos directamente sobre usuarios.

No existe en ese contrato una entidad persistente equivalente a:

```text
Perfil
├── nombre
├── clave
├── descripción
├── estatus
└── permisos
    ├── grupos
    ├── módulos
    └── acciones
```

## Lo que necesita publicar backend

Para habilitar la administración real de perfiles, backend deberá definir formalmente:

- modelo de perfil;
- listado y detalle;
- alta;
- edición;
- activación/inactivación;
- eliminación o baja lógica;
- asociación de grupos, módulos y acciones;
- asignación de un perfil a uno o varios usuarios;
- reglas de actualización cuando cambia un perfil ya asignado;
- auditoría de cambios;
- permisos administrativos necesarios para operar cada acción.

Los nombres concretos de endpoints, payloads y códigos de error **no se definen desde frontend**.

## Estado frontend

La ruta:

```text
/app/perfiles/nuevo
```

ya dispone de:

- nombre;
- clave;
- descripción;
- búsqueda en catálogo;
- árbol Grupo → Módulo → Acción;
- resumen de selección;
- validación visual.

El botón `Guardar perfil` permanece deshabilitado de forma intencional hasta recibir el contrato backend.
