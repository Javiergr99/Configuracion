# Configuración central de accesos — V1

## Objetivo

Configuración administra identidades y autorización del Ecosistema Integral DGCP utilizando el contrato real de `auth_service`. El frontend no crea roles paralelos ni utiliza UUID hardcodeados para decidir permisos.

## Jerarquía

`Grupo → Módulo → Acción`

Los nombres técnicos de grupo permanecen como fuente de verdad. La interfaz puede mostrar nombres amigables, pero siempre envía los IDs publicados por `GET /users/catalogo-permisos`.

## Alta multisistema

`POST /users` requiere un `grupo_id` inicial y crea automáticamente `UsuarioGrupo` para ese grupo. Posteriormente, `POST /users/{user_id}/permisos` completa los accesos.

Cuando los módulos o acciones seleccionados pertenecen a varios grupos, se envía `grupo_id: null` para que `auth_service` infiera los grupos padre. Los grupos adicionales seleccionados sin módulos ni acciones se agregan mediante `POST /users/{user_id}/grupos`.

La asignación masiva se ejecuta una sola vez para conservar un único punto de activación por correo.

## Control Agenda Nacional

La interfaz presenta los grupos `SEMAFORO_*` como alcances de Control Agenda Nacional:

- `SEMAFORO_ADMIN` → Administrador global.
- `SEMAFORO_DGRJRDNNA` → DGRJRDNNA.
- `SEMAFORO_DGRCAS` → DGRCAS.
- `SEMAFORO_DGNPDDNNA` → DGNPDDNNA.
- `SEMAFORO_DGCP` → DGCP.

No se crea un grupo artificial únicamente para la presentación visual. La API de Agenda continúa siendo la autoridad final de su rol funcional.

## SUPER_ADMIN

`SUPER_ADMIN` es una acción global especial. El frontend protege su selección para actores no autorizados, pero `auth_service` siempre realiza la validación definitiva.
