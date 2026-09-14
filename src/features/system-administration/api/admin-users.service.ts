import type { AdminUsersRepository } from "@/features/system-administration/api/admin-users.repository";
import { HttpAdminUsersRepository } from "@/features/system-administration/api/http-admin-users.repository";
import { MockAdminUsersRepository } from "@/features/system-administration/api/mock-admin-users.repository";

// Los mocks solo se habilitan explícitamente en desarrollo. En producción nunca sustituyen al backend real.
const useMocks = import.meta.env.DEV && import.meta.env.VITE_ENABLE_ADMIN_MOCKS === "true";

export const adminUsersService: AdminUsersRepository = useMocks
  ? new MockAdminUsersRepository()
  : new HttpAdminUsersRepository();
