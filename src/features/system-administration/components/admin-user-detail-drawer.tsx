import {
  Clock3,
  KeyRound,
  LockKeyholeOpen,
  MailCheck,
  Pencil,
  RotateCcwKey,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { SelectField } from "@/components/ui/select-field";
import { Tabs } from "@/components/ui/tabs";
import { getAdminErrorMessage } from "@/features/system-administration/api/admin-api-error";
import { AdminUserPermissionsDialog } from "@/features/system-administration/components/admin-user-permissions-dialog";
import { AdminUserStatusBadge } from "@/features/system-administration/components/admin-user-status-badge";
import {
  useAdminCurrentUser,
  useAdminUser,
  useAdminUserStatusMutation,
  usePasswordRecoveryMutation,
  useResendActivationMutation,
} from "@/features/system-administration/hooks/admin-users.hooks";
import {
  hasAdminAction,
  isSuperAdmin,
} from "@/features/system-administration/model/admin-authorization";
import {
  ADMIN_STATUS_CATALOG,
  type AdminUser,
} from "@/features/system-administration/model/admin-user.types";
import { getPermissionGroupPresentation } from "@/features/system-administration/model/system-access-presentation";

const ADMIN_USER_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const PERMISSION_MANAGEMENT_ACTIONS = [
  "ASIGNAR_GRUPOS_USUARIO",
  "ASIGNAR_MODULOS_USUARIO",
  "ASIGNAR_ACCIONES_USUARIO",
  "QUITAR_GRUPOS_USUARIO",
  "QUITAR_MODULOS_USUARIO",
  "QUITAR_ACCIONES_USUARIO",
] as const;

function Value({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[var(--ui-text-secondary)]">{label}</dt>
      <dd className="mt-1 text-sm text-[var(--ui-text-primary)]">{value || "No disponible"}</dd>
    </div>
  );
}

function formatDate(value?: string | null): string {
  return value ? ADMIN_USER_DATE_TIME_FORMATTER.format(new Date(value)) : "No disponible";
}

function canManageUserPermissions(
  actor: AdminUser | undefined,
  target: AdminUser | undefined,
): boolean {
  if (!actor || !target || actor.id === target.id || isSuperAdmin(target)) return false;
  return PERMISSION_MANAGEMENT_ACTIONS.some((action) => hasAdminAction(actor, action));
}

async function runStatusUpdate({
  user,
  nextStatusId,
  mutate,
}: {
  user: AdminUser;
  nextStatusId: string;
  mutate: (input: { id: string; statusId: number }) => Promise<AdminUser>;
}) {
  try {
    await mutate({ id: user.id, statusId: Number(nextStatusId) });
    toast.success(
      "Estatus actualizado. auth_service revocó las sesiones cuando existió un cambio efectivo.",
    );
  } catch (error) {
    toast.error(getAdminErrorMessage(error, "No fue posible cambiar el estatus."));
  }
}

async function runEmailOperation({
  user,
  operation,
  resendActivation,
  sendRecovery,
}: {
  user: AdminUser;
  operation: "activation" | "recovery";
  resendActivation: (id: string) => Promise<{ message: string }>;
  sendRecovery: (id: string) => Promise<{ message: string }>;
}) {
  try {
    const result =
      operation === "activation" ? await resendActivation(user.id) : await sendRecovery(user.id);
    toast.success(result.message);
  } catch (error) {
    toast.error(getAdminErrorMessage(error));
  }
}

function DrawerFooter({
  user,
  canEdit,
  onClose,
  onEdit,
}: {
  user: AdminUser | undefined;
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!user) return null;

  return (
    <div className="flex flex-wrap justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>
        Cerrar
      </Button>
      {canEdit ? (
        <Button onClick={onEdit}>
          <Pencil className="h-4 w-4" aria-hidden="true" /> Editar usuario
        </Button>
      ) : null}
    </div>
  );
}

function UserSummaryTab({
  user,
  targetIsSuperAdmin,
}: {
  user: AdminUser;
  targetIsSuperAdmin: boolean;
}) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-bold text-[var(--ui-text-primary)]">{user.fullName}</p>
          <p className="mt-1 text-sm text-[var(--ui-text-secondary)]">ID: {user.username}</p>
        </div>
        <AdminUserStatusBadge status={user.status} />
      </div>

      {targetIsSuperAdmin ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          Este usuario tiene la acción SUPER_ADMIN. La edición de permisos y el cambio de estatus
          permanecen bloqueados hasta que backend implemente la protección del último SUPER_ADMIN y
          el auto-retiro.
        </div>
      ) : null}

      <dl className="grid gap-5 rounded-xl border border-[var(--ui-border)] p-5 sm:grid-cols-2">
        <Value label="CURP" value={user.curp} />
        <Value label="Correo" value={user.email} />
        <Value label="Teléfono" value={user.phone} />
        <Value label="Entidad federativa" value={user.entity} />
        <Value label="Instancia" value={user.instance} />
        <Value label="Correo verificado" value={formatDate(user.emailVerifiedAt)} />
        <Value label="Fecha de creación" value={formatDate(user.createdAt)} />
        <Value label="Última actualización" value={formatDate(user.updatedAt)} />
      </dl>
    </div>
  );
}

function PermissionGroupHeading({ group }: { group: AdminUser["permissionGroups"][number] }) {
  const presentation = getPermissionGroupPresentation(group.name);

  return (
    <div>
      <h3 className="text-sm font-bold text-[var(--ui-text-primary)]">{presentation.title}</h3>
      {presentation.scope ? (
        <p className="mt-0.5 text-xs font-semibold text-[var(--ui-primary)]">
          {presentation.scope}
        </p>
      ) : null}
      <p className="mt-1 font-mono text-[10px] text-slate-400">{presentation.technicalName}</p>
    </div>
  );
}

function UserPermissionsTab({
  user,
  canManagePermissions,
  managementNotice,
  onManagePermissions,
}: {
  user: AdminUser;
  canManagePermissions: boolean;
  managementNotice?: string;
  onManagePermissions: () => void;
}) {
  return (
    <div className="space-y-6 p-6">
      {user.permissionGroups.length ? (
        user.permissionGroups.map((group) => (
          <section key={group.id} className="rounded-xl border border-[var(--ui-border)] p-4">
            <PermissionGroupHeading group={group} />
            <div className="mt-3 space-y-3">
              {group.modules.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-3 text-xs text-[var(--ui-text-secondary)]">
                  Acceso general al sistema o grupo, sin módulos o acciones directas asignadas.
                </p>
              ) : null}
              {group.modules.map((module) => (
                <div key={module.id} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-[var(--ui-text-primary)]">
                    {module.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {module.actions.map((action) => (
                      <span
                        key={action.id}
                        className="rounded-md bg-brand-50 px-2.5 py-1.5 text-[11px] font-semibold text-brand-700"
                      >
                        {action.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="text-sm text-[var(--ui-text-secondary)]">
          El usuario no tiene permisos jerárquicos asignados.
        </p>
      )}

      {managementNotice ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          {managementNotice}
        </div>
      ) : null}

      {canManagePermissions ? (
        <Button onClick={onManagePermissions}>
          <UserCog className="h-4 w-4" aria-hidden="true" /> Administrar permisos
        </Button>
      ) : null}
    </div>
  );
}

function SecurityItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof KeyRound;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[var(--ui-border)] p-4">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold text-[var(--ui-text-secondary)]">{label}</p>
        <p className="mt-1 text-sm font-bold text-[var(--ui-text-primary)]">{value}</p>
      </div>
    </div>
  );
}

function UserSecurityTab({
  user,
  canEdit,
  nextStatusId,
  statusPending,
  resendPending,
  recoveryPending,
  onStatusChange,
  onApplyStatus,
  onActivation,
  onRecovery,
}: {
  user: AdminUser;
  canEdit: boolean;
  nextStatusId: string;
  statusPending: boolean;
  resendPending: boolean;
  recoveryPending: boolean;
  onStatusChange: (value: string) => void;
  onApplyStatus: () => void;
  onActivation: () => void;
  onRecovery: () => void;
}) {
  return (
    <div className="space-y-5 p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <SecurityItem
          label="Autenticación 2FA"
          value={user.twoFactorEnabled ? "Configurada" : "Pendiente"}
          icon={ShieldCheck}
        />
        <SecurityItem
          label="Intentos de login"
          value={String(user.loginAttempts ?? 0)}
          icon={KeyRound}
        />
      </div>

      <div className="rounded-xl border border-[var(--ui-border)] p-4">
        <p className="text-sm font-bold text-[var(--ui-text-primary)]">Correos administrativos</p>
        <p className="mt-1 text-xs leading-5 text-[var(--ui-text-secondary)]">
          Reenviar activación aplica a usuarios sin contraseña. Recuperación aplica a usuarios que
          ya tienen contraseña; auth_service validará la condición.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={onActivation} disabled={!canEdit || resendPending}>
            <MailCheck className="h-4 w-4" aria-hidden="true" /> Reenviar activación
          </Button>
          <Button variant="secondary" onClick={onRecovery} disabled={!canEdit || recoveryPending}>
            <RotateCcwKey className="h-4 w-4" aria-hidden="true" /> Recuperar contraseña
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--ui-border)] p-4">
        <p className="text-sm font-bold text-[var(--ui-text-primary)]">Cambiar estatus</p>
        <p className="mt-1 text-xs leading-5 text-[var(--ui-text-secondary)]">
          La ruta vigente no recibe motivo. Todo cambio efectivo incrementa token_version, revoca
          sesiones y envía correo.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <SelectField
              label="Nuevo estatus"
              value={nextStatusId}
              onValueChange={onStatusChange}
              options={ADMIN_STATUS_CATALOG.map((item) => ({
                value: String(item.id),
                label: `${item.id} — ${item.name}`,
              }))}
              disabled={!canEdit}
            />
          </div>
          <Button onClick={onApplyStatus} disabled={!canEdit || statusPending}>
            Aplicar estatus
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" disabled title="Pendiente de auth_service">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Restablecer 2FA
        </Button>
        <Button variant="secondary" disabled title="Pendiente de auth_service">
          <LockKeyholeOpen className="h-4 w-4" aria-hidden="true" /> Desbloqueo especializado
        </Button>
      </div>
    </div>
  );
}

function UserActivityTab() {
  return (
    <div className="p-6">
      <div className="rounded-xl border border-dashed border-[var(--ui-border)] p-8 text-center">
        <Clock3 className="mx-auto h-6 w-6 text-[var(--ui-primary)]" aria-hidden="true" />
        <p className="mt-3 text-sm font-bold text-[var(--ui-text-primary)]">
          Historial pendiente de backend
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--ui-text-secondary)]">
          auth_service v1.0 no publica una ruta de auditoría administrativa. No se mostrarán
          registros ficticios.
        </p>
      </div>
    </div>
  );
}

function AdminUserTabs({
  user,
  targetIsSuperAdmin,
  canManagePermissions,
  managementNotice,
  canEdit,
  nextStatusId,
  statusPending,
  resendPending,
  recoveryPending,
  onManagePermissions,
  onStatusChange,
  onApplyStatus,
  onActivation,
  onRecovery,
}: {
  user: AdminUser;
  targetIsSuperAdmin: boolean;
  canManagePermissions: boolean;
  managementNotice?: string;
  canEdit: boolean;
  nextStatusId: string;
  statusPending: boolean;
  resendPending: boolean;
  recoveryPending: boolean;
  onManagePermissions: () => void;
  onStatusChange: (value: string) => void;
  onApplyStatus: () => void;
  onActivation: () => void;
  onRecovery: () => void;
}) {
  return (
    <Tabs
      defaultValue="summary"
      tabs={[
        {
          value: "summary",
          label: "Resumen",
          content: <UserSummaryTab user={user} targetIsSuperAdmin={targetIsSuperAdmin} />,
        },
        {
          value: "permissions",
          label: "Accesos y permisos",
          content: (
            <UserPermissionsTab
              user={user}
              canManagePermissions={canManagePermissions}
              managementNotice={managementNotice}
              onManagePermissions={onManagePermissions}
            />
          ),
        },
        {
          value: "security",
          label: "Seguridad",
          content: (
            <UserSecurityTab
              user={user}
              canEdit={canEdit}
              nextStatusId={nextStatusId}
              statusPending={statusPending}
              resendPending={resendPending}
              recoveryPending={recoveryPending}
              onStatusChange={onStatusChange}
              onApplyStatus={onApplyStatus}
              onActivation={onActivation}
              onRecovery={onRecovery}
            />
          ),
        },
        {
          value: "activity",
          label: "Actividad",
          content: <UserActivityTab />,
        },
      ]}
    />
  );
}

function DrawerContent({
  isLoading,
  user,
  tabs,
}: {
  isLoading: boolean;
  user: AdminUser | undefined;
  tabs: ReactNode;
}) {
  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Cargando detalle...</div>;
  }

  if (!user) {
    return <div className="p-6 text-sm text-red-600">No se pudo cargar el usuario.</div>;
  }

  return tabs;
}

export function AdminUserDetailDrawer({
  userId,
  onOpenChange,
}: {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const query = useAdminUser(userId);
  const currentUserQuery = useAdminCurrentUser();
  const statusMutation = useAdminUserStatusMutation();
  const resend = useResendActivationMutation();
  const recovery = usePasswordRecoveryMutation();
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [nextStatusId, setNextStatusId] = useState("1");
  const user = query.data;
  const actor = currentUserQuery.data;
  const targetIsSuperAdmin = isSuperAdmin(user);
  const targetIsCurrentUser = Boolean(actor && user && actor.id === user.id);
  const canEdit =
    hasAdminAction(actor, "ACTUALIZAR_USUARIO") && !targetIsSuperAdmin && !targetIsCurrentUser;
  const canManagePermissions = canManageUserPermissions(actor, user);
  const managementNotice = targetIsCurrentUser
    ? "No puedes modificar tus propios accesos desde esta sesión. Utiliza otra cuenta administrativa autorizada."
    : targetIsSuperAdmin
      ? "Los permisos de un SUPER_ADMIN permanecen protegidos hasta que backend publique salvaguardas de último superadministrador y auto-retiro."
      : undefined;

  const closeDrawer = () => onOpenChange(false);
  const editUser = () => {
    if (!user) return;
    closeDrawer();
    void navigate(`/app/usuarios/${encodeURIComponent(user.id)}/editar`);
  };

  const tabs = user ? (
    <AdminUserTabs
      user={user}
      targetIsSuperAdmin={targetIsSuperAdmin}
      canManagePermissions={canManagePermissions}
      managementNotice={managementNotice}
      canEdit={canEdit}
      nextStatusId={nextStatusId}
      statusPending={statusMutation.isPending}
      resendPending={resend.isPending}
      recoveryPending={recovery.isPending}
      onManagePermissions={() => setPermissionsOpen(true)}
      onStatusChange={setNextStatusId}
      onApplyStatus={() => {
        void runStatusUpdate({
          user,
          nextStatusId,
          mutate: statusMutation.mutateAsync,
        });
      }}
      onActivation={() => {
        void runEmailOperation({
          user,
          operation: "activation",
          resendActivation: resend.mutateAsync,
          sendRecovery: recovery.mutateAsync,
        });
      }}
      onRecovery={() => {
        void runEmailOperation({
          user,
          operation: "recovery",
          resendActivation: resend.mutateAsync,
          sendRecovery: recovery.mutateAsync,
        });
      }}
    />
  ) : null;

  return (
    <>
      <Drawer
        open={Boolean(userId)}
        onOpenChange={onOpenChange}
        title={user?.fullName ?? "Detalle del usuario"}
        description={user ? `${user.curp} · ${user.email}` : "Cargando información..."}
        widthClassName="w-[760px] max-w-[94vw]"
        footer={
          <DrawerFooter user={user} canEdit={canEdit} onClose={closeDrawer} onEdit={editUser} />
        }
      >
        <DrawerContent isLoading={query.isLoading} user={user} tabs={tabs} />
      </Drawer>

      {user ? (
        <AdminUserPermissionsDialog
          open={permissionsOpen}
          onOpenChange={setPermissionsOpen}
          user={user}
        />
      ) : null}
    </>
  );
}
