import {
  mapAdminUserDetail,
  mapAdminUserListItem,
  mapStatusById,
  summarizeUsers,
} from "@/features/system-administration/model/admin-user.mapper";

describe("admin user mapper", () => {
  it("convierte UserListPublic sin asumir 2FA ni fechas", () => {
    const result = mapAdminUserListItem({
      id: "user-1",
      nombre: "Javier",
      primer_apellido: "García",
      segundo_apellido: null,
      correo_electronico: "javier@ejemplo.gob.mx",
      curp: "GAXJ900101HDFRRV01",
      estatus: { id: 2, nombre: "En Proceso" },
      instancia: { id: 1, nombre: "Sistema Nacional DIF", siglas: "SNDIF" },
      entidad_federativa_id: 9,
      grupos: [{ id: "group-1", nombre: "MESA_AYUDA" }],
    });

    expect(result.fullName).toBe("Javier García");
    expect(result.status).toBe("EN_PROCESO");
    expect(result.groups.map((group) => group.name)).toEqual(["MESA_AYUDA"]);
    expect(result.twoFactorEnabled).toBeUndefined();
  });

  it("mapea el detalle jerárquico de permisos", () => {
    const result = mapAdminUserDetail({
      id: "user-1",
      nombre: "Javier",
      primer_apellido: "García",
      segundo_apellido: null,
      correo_electronico: "javier@ejemplo.gob.mx",
      curp: "GAXJ900101HDFRRV01",
      entidad_federativa_id: 9,
      numero_telefono: null,
      is_2fa_enabled: true,
      estatus: { id: 1, nombre: "Activo" },
      instancia: { id: 1, nombre: "Sistema Nacional DIF", siglas: "SNDIF" },
      intentos_login: 0,
      fecha_correo_verificado: null,
      fecha_creacion: "2026-08-06T10:00:00-06:00",
      fecha_actualizacion: "2026-08-06T10:00:00-06:00",
      permisos: {
        grupos: [
          {
            id: "group-1",
            nombre: "MESA_AYUDA",
            modulos: [
              {
                id: "module-1",
                nombre: "ADMINISTRACION_USUARIOS",
                acciones: [{ id: "action-1", nombre: "VER_USUARIOS" }],
              },
            ],
          },
        ],
      },
    });

    expect(result.permissions).toEqual(["VER_USUARIOS"]);
    expect(result.permissionGroups[0]?.modules[0]?.name).toBe("ADMINISTRACION_USUARIOS");
  });

  it("utiliza los IDs oficiales de estatus", () => {
    expect([1, 2, 3, 4, null].map(mapStatusById)).toEqual([
      "ACTIVO",
      "EN_PROCESO",
      "INACTIVO",
      "BLOQUEADO",
      "SIN_ESTATUS",
    ]);
  });

  it("calcula el resumen únicamente con datos disponibles", () => {
    const base = mapAdminUserListItem({
      id: "user-1",
      nombre: "A",
      primer_apellido: "B",
      correo_electronico: "a@b.mx",
      curp: "GAXJ900101HDFRRV01",
      grupos: [],
    });
    const users = [
      { ...base, id: "1", status: "ACTIVO" as const },
      { ...base, id: "2", status: "EN_PROCESO" as const },
      { ...base, id: "3", status: "INACTIVO" as const },
      { ...base, id: "4", status: "BLOQUEADO" as const },
      { ...base, id: "5", status: "SIN_ESTATUS" as const },
    ];
    expect(summarizeUsers(users)).toEqual({
      total: 5,
      active: 1,
      inProcess: 1,
      inactive: 2,
      blocked: 1,
    });
  });
});
