# Configuración — Ecosistema Integral DGCP

Frontend administrativo independiente para la configuración transversal del **Ecosistema Integral DGCP**.

Este proyecto nace a partir de los componentes administrativos que anteriormente estaban integrados dentro de `mesa_de_ayuda`. Su propósito es separar la operación diaria de Mesa de Ayuda de las funciones de administración global del ecosistema.

## Alcance actual

- Resumen administrativo.
- Diseño de perfiles de acceso.
- Consulta del catálogo real de permisos `Grupo → Módulo → Acción`.
- Administración de usuarios.
- Alta de usuarios.
- Edición de usuarios.
- Asignación y retiro de permisos por usuario.
- Configuración visual e identidad.
- Historial administrativo preparado para integración futura.

## Rutas

```text
/app/dashboard
/app/perfiles
/app/perfiles/nuevo
/app/permisos
/app/usuarios
/app/usuarios/nuevo
/app/usuarios/:userId/editar
/app/apariencia
/app/historial
```

## Autenticación

Reutiliza el patrón vigente:

```text
login_admin
   │
   └── redirect-code
          │
          ▼
configuracion
          │
          └── exchange-code
                 │
                 ▼
              sesión
```

El access token se mantiene en memoria. La renovación se delega a `auth_service`.

## Perfiles de acceso

`auth_service` publica actualmente:

- usuarios;
- grupos;
- módulos;
- acciones;
- catálogo de permisos;
- asignación y retiro de permisos directamente sobre un usuario.

No publica todavía un CRUD de **perfiles reutilizables**. Por ello la interfaz permite diseñar una definición de perfil usando el catálogo real, pero **Guardar perfil permanece deshabilitado** hasta contar con un contrato backend confirmado.

No se presentan perfiles ficticios ni se simula persistencia.

## Desarrollo local

```powershell
npm install
npm run dev
```

Puerto sugerido:

```text
http://127.0.0.1:5180
```

Antes de probar la integración real, backend debe autorizar los redirect-code del nuevo frontend.

## Calidad

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
npx -y react-doctor@latest . --scope full --score
```

Durante la separación inicial se validaron correctamente `typecheck`, `lint` y la estructura de importaciones. Las pruebas y el build deben ejecutarse en el entorno Windows del proyecto después de `npm install`, porque el `node_modules` recibido dentro del ZIP original correspondía a binarios nativos de Windows y no puede ejecutar Rolldown/Vitest en el entorno Linux de preparación.

## Origen de los componentes

Los módulos `system-administration` y `appearance-settings` provienen del frontend `mesa_de_ayuda`, pero ahora pertenecen conceptualmente a este frontend independiente.

No elimines todavía sus originales de Mesa de Ayuda hasta validar visualmente y funcionalmente este proyecto. Consulta:

```text
docs/MIGRACION_DESDE_MESA_DE_AYUDA.md
```
