import { describe, expect, it } from "vitest";

import {
  buildAdminUserEditDefaultValues,
  buildAdminUserInstanceOptions,
  buildAdminUserUpdateInput,
  getAdminUserProtectionMessage,
} from "@/features/system-administration/model/admin-user-edit";
import type { AdminUser } from "@/features/system-administration/model/admin-user.types";

const user: AdminUser = {
  id: "user-1",
  username: "user-1",
  fullName: "Usuario Prueba",
  firstName: "Usuario",
  firstSurname: "Prueba",
  curp: "TEST000000HDFXXX00",
  email: "usuario@example.test",
  instanceId: 7,
  instance: "Instancia vigente",
  entityId: 9,
  entity: "Ciudad de México",
  groups: [],
  statusId: 1,
  status: "ACTIVO",
  permissionGroups: [],
  permissions: [],
};

describe("admin-user-edit", () => {
  it("construye valores iniciales del formulario directamente desde el usuario", () => {
    expect(buildAdminUserEditDefaultValues(user)).toEqual({
      firstName: "Usuario",
      firstSurname: "Prueba",
      secondSurname: "",
      curp: "TEST000000HDFXXX00",
      email: "usuario@example.test",
      phone: "",
      instanceId: "7",
      entityId: "9",
    });
  });

  it("conserva la instancia actual cuando no aparece en las opciones cargadas", () => {
    expect(buildAdminUserInstanceOptions(user, [])).toEqual([
      { value: "7", label: "Instancia vigente" },
    ]);
  });

  it("no duplica la instancia actual cuando ya existe en el catálogo", () => {
    const options = [{ value: "7", label: "Instancia vigente" }];
    expect(buildAdminUserInstanceOptions(user, options)).toBe(options);
  });

  it("construye el payload únicamente con campos modificados", () => {
    expect(
      buildAdminUserUpdateInput(
        {
          firstName: "Nuevo nombre",
          firstSurname: "Prueba",
          secondSurname: "",
          curp: user.curp,
          email: user.email,
          phone: "",
          instanceId: "7",
          entityId: "9",
        },
        { firstName: true, phone: true },
      ),
    ).toEqual({
      firstName: "Nuevo nombre",
      phone: null,
    });
  });

  it("mantiene mensajes distintos para autoedición y SUPER_ADMIN", () => {
    expect(getAdminUserProtectionMessage({ selfTarget: true, superAdminTarget: false })).toContain(
      "propia cuenta administrativa",
    );
    expect(getAdminUserProtectionMessage({ selfTarget: false, superAdminTarget: true })).toContain(
      "SUPER_ADMIN",
    );
  });
});
