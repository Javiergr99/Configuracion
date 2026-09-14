# Requerimiento: persistencia institucional de apariencia

## Necesidad funcional

Permitir que un administrador autorizado publique una configuración visual única para Ecosistema Integral DGCP y que todos los usuarios reciban esos Design Tokens al iniciar o actualizar su sesión.

## Alcance esperado

- Consultar la configuración institucional vigente.
- Guardar una nueva versión de colores, tipografía, pesos y radios.
- Restringir la modificación a `ADMINISTRAR_USUARIOS` o `SUPER_ADMIN`, según la matriz que backend determine.
- Validar formatos y valores permitidos.
- Registrar autor, fecha y versión del cambio.
- Mantener una configuración predeterminada segura si no existe una publicación.
- Distribuir la configuración a todos los usuarios, navegadores y dispositivos.
- Definir estrategia de caché e invalidación.

## Design Tokens requeridos

- `primary`
- `canvas`
- `surface`
- `sidebar`
- `sidebarText`
- `textPrimary`
- `textSecondary`
- `border`
- `success`
- `warning`
- `danger`
- `fontFamily`
- `headingWeight`
- `bodyWeight`
- `cardRadius`
- `controlRadius`

## Regla de integración

Este documento no propone ni fija rutas, schemas o decisiones internas. El frontend conectará la capacidad únicamente cuando backend la publique en el OpenAPI vigente junto con requests, responses, permisos y errores.
