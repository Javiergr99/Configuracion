import type {
  AdminSelectOption,
  AdminUser,
  UpdateAdminUserInput,
} from "@/features/system-administration/model/admin-user.types";
import type { UpdateAdminUserFormValues } from "@/features/system-administration/model/admin-user.schema";

const ADMIN_USER_SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "short",
});

export type AdminUserEditDirtyFields = Partial<Record<keyof UpdateAdminUserFormValues, boolean>>;

export function formatAdminUserDate(value?: string): string {
  if (!value) return "No disponible";
  return ADMIN_USER_SHORT_DATE_FORMATTER.format(new Date(value));
}

export function buildAdminUserEditDefaultValues(user: AdminUser): UpdateAdminUserFormValues {
  return {
    firstName: user.firstName,
    firstSurname: user.firstSurname,
    secondSurname: user.secondSurname ?? "",
    curp: user.curp,
    email: user.email,
    phone: user.phone ?? "",
    instanceId: user.instanceId ? String(user.instanceId) : "",
    entityId: user.entityId ? String(user.entityId) : "",
  };
}

export function buildAdminUserInstanceOptions(
  user: AdminUser | undefined,
  options: AdminSelectOption[],
): AdminSelectOption[] {
  if (!user?.instanceId || options.some((item) => item.value === String(user.instanceId))) {
    return options;
  }

  return [{ value: String(user.instanceId), label: user.instance }, ...options];
}

export function buildAdminUserUpdateInput(
  values: UpdateAdminUserFormValues,
  dirty: AdminUserEditDirtyFields,
): UpdateAdminUserInput {
  return {
    ...(dirty.firstName ? { firstName: values.firstName } : {}),
    ...(dirty.firstSurname ? { firstSurname: values.firstSurname } : {}),
    ...(dirty.secondSurname ? { secondSurname: values.secondSurname || null } : {}),
    ...(dirty.curp ? { curp: values.curp } : {}),
    ...(dirty.email ? { email: values.email } : {}),
    ...(dirty.phone ? { phone: values.phone || null } : {}),
    ...(dirty.instanceId
      ? { instanceId: values.instanceId ? Number(values.instanceId) : null }
      : {}),
    ...(dirty.entityId ? { entityId: values.entityId ? Number(values.entityId) : null } : {}),
  };
}

export function getAdminUserProtectionMessage({
  selfTarget,
  superAdminTarget,
}: {
  selfTarget: boolean;
  superAdminTarget: boolean;
}): string {
  if (selfTarget) {
    return "No puedes editar tu propia cuenta administrativa desde esta sesión. Utiliza otra cuenta autorizada para evitar un bloqueo accidental.";
  }

  if (superAdminTarget) {
    return "La edición general de una cuenta SUPER_ADMIN permanece restringida en Configuración. Administra sus accesos desde la sección de permisos; auth_service aplica las salvaguardas administrativas.";
  }

  return "No cuentas con permisos suficientes para editar este usuario.";
}
