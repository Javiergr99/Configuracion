# Requerimientos futuros del módulo administrativo

Este archivo es un backlog funcional. **No define rutas, schemas ni decisiones internas de backend.** Cada capacidad solo podrá integrarse cuando aparezca en el OpenAPI vigente.

## Prioridad 1

- Resumen eficiente de usuarios sin descargar la lista completa.
- Búsqueda, filtros, ordenamiento y paginación en servidor.
- Restablecimiento administrativo de 2FA.
- Desbloqueo especializado de cuentas.
- Reglas completas para auto-desactivación, auto-retiro y último `SUPER_ADMIN`.
- Catálogos oficiales de entidades e instancias para evitar captura manual de IDs.

## Prioridad 2

- Actualización atómica de permisos con cálculo de diferencias.
- Metadatos de asignabilidad y motivo de bloqueo en el catálogo.
- Motivo administrativo en operaciones sensibles.
- Control de concurrencia para evitar sobrescrituras simultáneas.

## Prioridad 3

- Auditoría administrativa institucional.
- Administración lógica del catálogo de grupos, módulos y acciones.
- Persistencia institucional y distribución global de Design Tokens.

Cada elemento deberá documentarse como requerimiento separado y backend definirá la ruta, los schemas, las reglas y la estrategia de persistencia correspondientes.
