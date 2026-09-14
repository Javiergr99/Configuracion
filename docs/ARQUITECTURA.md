# Arquitectura — Configuración

## Responsabilidad

`configuracion` es el frontend administrativo del Ecosistema Integral DGCP.

No debe contener lógica operativa de Mesa de Ayuda, Formato NNA, Directorio de Procuradores o Control Agenda Nacional. Su responsabilidad es centralizar administración transversal:

```text
Configuración
├── Perfiles
├── Catálogo de permisos
├── Usuarios
├── Apariencia
└── Historial
```

## Capas

```text
src/
├── app/
│   ├── providers/
│   ├── router/
│   └── styles/
├── components/
│   ├── layout/
│   └── ui/
├── features/
│   ├── access-profiles/
│   ├── appearance-settings/
│   ├── auth/
│   ├── configuration-dashboard/
│   ├── permission-catalog/
│   ├── placeholders/
│   └── system-administration/
└── shared/
    ├── catalogs/
    ├── config/
    └── lib/
```

## Límites

### `access-profiles`

Construye la experiencia visual para perfiles reutilizables. Consume el catálogo real de permisos, pero no persiste perfiles mientras backend no publique ese contrato.

### `system-administration`

Contiene las funciones ya soportadas por `auth_service`:

- consultar usuarios;
- crear usuarios;
- editar usuarios;
- cambiar estatus;
- reenviar activación;
- recuperación de contraseña;
- consultar catálogo;
- agregar y retirar grupo/módulo/acción.

La sincronización de permisos mantiene el orden contractual existente.

### `appearance-settings`

Administra borradores locales de identidad y Design Tokens. La publicación global permanece pendiente de contrato backend.

### `auth`

Mantiene redirect-code, exchange-code, sesión en memoria, refresh y cierre de sesión.

## Independencia

El frontend puede desplegarse de manera independiente. La reutilización visual con otros frontends se hace copiando los mismos Design Tokens y primitivas UI mientras no exista un paquete compartido del ecosistema.

No se debe importar código mediante rutas relativas hacia `../mesa_de_ayuda`.
