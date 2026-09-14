# Administración central de usuarios y permisos — V2

## Objetivo

Configuración es la interfaz administrativa del Ecosistema Integral DGCP para crear usuarios,
consultar su estado y administrar sus accesos mediante el contrato vigente de `auth_service`.

La fuente de verdad de autorización sigue siendo `auth_service`. El frontend solamente realiza
validaciones previas para evitar operaciones inválidas o de alcance incorrecto antes de enviar una
petición.

## Jerarquía de autorización

```text
Grupo
└── Módulo
    └── Acción
```

Los UUID provienen siempre del catálogo vigente; la lógica visual y de autorización usa nombres
técnicos estables y relaciones recibidas desde backend.

## Alta de usuarios

1. `POST /users` crea la identidad con un `grupo_id` primario obligatorio.
2. Antes de crear, Configuración valida `CREAR_USUARIO` dentro del grupo primario, salvo
   `SUPER_ADMIN`.
3. `POST /users/{user_id}/permisos` aplica la asignación funcional inicial.
4. Cuando la selección contiene módulos o acciones de varios grupos, se envía `grupo_id=null` y
   backend infiere los grupos padre.
5. Los grupos adicionales sin módulos o acciones se agregan con
   `POST /users/{user_id}/grupos`.
6. La validación previa verifica los permisos administrativos en cada grupo afectado, no solo la
   presencia global del nombre de una acción.

## Edición de accesos

La edición calcula un delta entre el estado actual y la selección nueva:

```text
Actual: A B C D
Nuevo:  A B D E

Retirar: C
Agregar: E
```

`auth_service` v1.0 no publica una operación atómica de reemplazo. Configuración usa los endpoints
individuales existentes y, por seguridad, ejecuta primero los retiros y después las altas:

1. retirar acciones;
2. retirar módulos;
3. retirar grupos;
4. agregar grupos;
5. agregar módulos;
6. agregar acciones.

Si una operación falla, la secuencia se detiene y el frontend vuelve a consultar el estado real del
usuario.

## Validación por alcance

Un administrador ordinario debe poseer la acción administrativa requerida dentro del grupo objetivo.
No basta con tener una acción con el mismo nombre en otro grupo.

Ejemplo:

```text
ASIGNAR_ACCIONES_USUARIO en MESA_AYUDA
```

no autoriza por sí sola una asignación dentro de:

```text
SEMAFORO_DGCP
```

`SUPER_ADMIN` conserva el bypass global definido por backend.

## Control Agenda Nacional

Los grupos técnicos de Agenda se presentan con nombres comprensibles sin alterar el contrato:

```text
SEMAFORO_ADMIN      → Control Agenda Nacional — Administrador global
SEMAFORO_DGRJRDNNA → Control Agenda Nacional — DGRJRDNNA
SEMAFORO_DGRCAS     → Control Agenda Nacional — DGRCAS
SEMAFORO_DGNPDDNNA → Control Agenda Nacional — DGNPDDNNA
SEMAFORO_DGCP       → Control Agenda Nacional — DGCP
```

## Salvaguardas frontend

Mientras backend no publique salvaguardas explícitas de auto-retiro y último superadministrador:

- una sesión no puede modificar sus propios grupos, módulos o acciones desde Configuración;
- una sesión no puede editar su propia cuenta administrativa desde esta pantalla;
- los objetivos con `SUPER_ADMIN` permanecen protegidos en las operaciones sensibles ya bloqueadas
  por la interfaz;
- estas protecciones frontend no sustituyen una validación equivalente en backend.

## Limitaciones vigentes del contrato

- No existe reemplazo atómico de todos los permisos de un usuario.
- No existe endpoint de auditoría administrativa para mostrar historial real.
- No existe endpoint específico para restablecer 2FA desde Configuración.
- No existe catálogo administrativo de instancias dedicado; la interfaz usa únicamente la
  información autorizada disponible en el contrato actual.

No deben simularse estas capacidades hasta que backend publique el contrato correspondiente.
