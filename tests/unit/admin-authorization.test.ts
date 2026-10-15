import { describe, expect, it } from "vitest";

import {
  getAdminUserSecurityCapabilities,
  hasAdminAction,
} from "@/features/system-administration/model/admin-authorization";
import type { AdminUser } from "@/features/system-administration/model/admin-user.types";

function createAdminUser(id: string, permissions: string[]): AdminUser {
  return {
    id,
    permissions,
  } as AdminUser;
}

describe("admin authorization", () => {
  it("mantiene SUPER_ADMIN como permiso global", () => {
    const actor = createAdminUser("actor", ["SUPER_ADMIN"]);

    expect(hasAdminAction(actor, "ACTUALIZAR_USUARIO")).toBe(true);
  });

  it("permite recuperación propia a SUPER_ADMIN sin habilitar edición general", () => {
    const actor = createAdminUser("same-user", ["SUPER_ADMIN"]);

    expect(getAdminUserSecurityCapabilities(actor, actor)).toEqual({
      canEdit: false,
      canSendPasswordRecovery: true,
    });
  });

  it("permite recuperación de otro SUPER_ADMIN sin habilitar su edición general", () => {
    const actor = createAdminUser("actor", ["SUPER_ADMIN"]);
    const target = createAdminUser("target", ["SUPER_ADMIN"]);

    expect(getAdminUserSecurityCapabilities(actor, target)).toEqual({
      canEdit: false,
      canSendPasswordRecovery: true,
    });
  });

  it("permite editar y recuperar un usuario ordinario con ACTUALIZAR_USUARIO", () => {
    const actor = createAdminUser("actor", ["ACTUALIZAR_USUARIO"]);
    const target = createAdminUser("target", []);

    expect(getAdminUserSecurityCapabilities(actor, target)).toEqual({
      canEdit: true,
      canSendPasswordRecovery: true,
    });
  });

  it("bloquea recuperación sin ACTUALIZAR_USUARIO", () => {
    const actor = createAdminUser("actor", ["VER_USUARIOS"]);
    const target = createAdminUser("target", []);

    expect(getAdminUserSecurityCapabilities(actor, target)).toEqual({
      canEdit: false,
      canSendPasswordRecovery: false,
    });
  });
});
