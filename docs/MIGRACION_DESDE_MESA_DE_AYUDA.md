# Migración desde Mesa de Ayuda

## Objetivo

Después de validar `frontend/configuracion`, Mesa de Ayuda debe quedarse únicamente con responsabilidades operativas.

## Dominio que se trasladó a Configuración

Estos directorios pertenecen al nuevo frontend:

```text
src/features/system-administration/
src/features/appearance-settings/
```

También migran sus contratos y documentación administrativa.

## No eliminar todavía

Las primitivas genéricas de `src/components/ui/` no deben borrarse en bloque de Mesa de Ayuda. Atenciones, Dashboard, Seguimiento y otros módulos siguen utilizándolas.

Lo mismo aplica para:

```text
src/features/auth/
src/components/layout/access-hub-button.tsx
src/app/styles/
```

Cada frontend independiente necesita su propio shell y su integración de autenticación hasta que exista un paquete compartido formal.

## Limpieza futura en mesa_de_ayuda

Una vez validado Configuración:

1. retirar las rutas:
   - `/app/usuarios`
   - `/app/usuarios/nuevo`
   - `/app/usuarios/:userId/editar`
   - `/app/usuarios/historial`
   - `/app/configuracion`
   - `/app/configuracion/apariencia`

2. retirar del sidebar:
   - `Usuarios`
   - `Historial administrativo`
   - `Configuración`

3. retirar del header el acceso local a Configuración visual.

4. eliminar:
   - `src/features/system-administration/`
   - `src/features/appearance-settings/`

5. eliminar tests exclusivos:
   - `tests/unit/admin-user-mapper.test.ts`
   - `tests/unit/appearance-utils.test.ts`
   - `tests/unit/color-contrast.test.ts`
   - `tests/unit/identity-asset-validation.test.ts`
   - `tests/unit/permission-operation-plan.test.ts`

6. mover o retirar documentación administrativa:
   - `docs/CONTRATO_ADMIN_AUTH_SERVICE_V1.md`
   - `docs/MODULO_ADMINISTRACION_USUARIOS.md`
   - `docs/MODULO_CONFIGURACION_IDENTIDAD.md`
   - `docs/contracts/auth-service-admin-v1.0/`
   - `docs/roadmap/REQUERIMIENTOS_FUTUROS_ADMIN.md`
   - `docs/roadmap/REQUERIMIENTO_BACKEND_APARIENCIA_GLOBAL.md`

## Importante

No borrar ningún componente genérico solo porque también exista en Configuración.

Dos frontends independientes pueden tener sus propias primitivas UI. La duplicación que se debe evitar primero es la **duplicación de responsabilidad de negocio**.

Si más adelante se quiere eliminar también duplicación técnica de `Button`, `Card`, `SelectField`, tokens, etc., la solución correcta es crear un paquete compartido del ecosistema, por ejemplo:

```text
frontend/
└── packages/
    └── ui/
```

y no hacer imports cruzados entre aplicaciones.
