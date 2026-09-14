import { CheckCircle2, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminUserStatusBadge } from "@/features/system-administration/components/admin-user-status-badge";
import type { CreateAdminUserResult } from "@/features/system-administration/model/admin-user.types";

function permissionCounts(result: CreateAdminUserResult) {
  const groups = result.groupsAssigned ?? result.user.permissionGroups.length;
  const modules =
    result.modulesAssigned ??
    result.user.permissionGroups.reduce((total, group) => total + group.modules.length, 0);
  const actions =
    result.actionsAssigned ??
    result.user.permissionGroups.reduce(
      (total, group) =>
        total +
        group.modules.reduce((moduleTotal, module) => moduleTotal + module.actions.length, 0),
      0,
    );
  return { groups, modules, actions };
}

export function AdminUserCreateSuccess({
  result,
  onViewUser,
  onCreateAnother,
  onBackToList,
}: {
  result: CreateAdminUserResult;
  onViewUser: () => void;
  onCreateAnother: () => void;
  onBackToList: () => void;
}) {
  const counts = permissionCounts(result);
  const user = result.user;

  return (
    <section className="mx-auto w-full max-w-[680px] rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-8 py-8 text-center shadow-sm">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-500">
        <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
      </span>
      <h2 className="mt-5 text-xl font-bold text-[var(--ui-text-primary)]">
        ¡Usuario registrado exitosamente!
      </h2>
      <p className="mt-1 text-sm text-[var(--ui-text-secondary)]">
        Se creó la cuenta y se procesó la asignación inicial de accesos.
      </p>

      <div className="mt-6 rounded-xl border border-[var(--ui-border)] bg-slate-50 p-5 text-left">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-[var(--ui-primary)]">
            {user.firstName.charAt(0)}
            {user.firstSurname.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[var(--ui-text-primary)]">
              {user.fullName}
            </p>
            <p className="mt-0.5 truncate text-xs text-[var(--ui-text-secondary)]">ID: {user.id}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <dt className="text-[11px] font-semibold uppercase text-[var(--ui-text-secondary)]">
              CURP
            </dt>
            <dd className="mt-1 text-sm text-[var(--ui-text-primary)]">{user.curp}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase text-[var(--ui-text-secondary)]">
              Correo electrónico
            </dt>
            <dd className="mt-1 text-sm text-[var(--ui-text-primary)]">{user.email}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase text-[var(--ui-text-secondary)]">
              Instancia
            </dt>
            <dd className="mt-1 text-sm text-[var(--ui-text-primary)]">{user.instance}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase text-[var(--ui-text-secondary)]">
              Estatus
            </dt>
            <dd className="mt-1">
              <AdminUserStatusBadge status={user.status} />
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[11px] font-semibold uppercase text-[var(--ui-text-secondary)]">
              Permisos asignados
            </dt>
            <dd className="mt-1 text-sm text-[var(--ui-text-primary)]">
              {counts.groups} grupo{counts.groups === 1 ? "" : "s"}, {counts.modules} módulo
              {counts.modules === 1 ? "" : "s"}, {counts.actions} acción
              {counts.actions === 1 ? "" : "es"}
            </dd>
          </div>
        </dl>
      </div>

      <div
        className={`mt-5 flex items-start gap-3 border-l-4 px-4 py-3 text-left text-sm leading-5 ${
          result.warning
            ? "border-amber-500 bg-amber-50 text-amber-800"
            : "border-[var(--ui-primary)] bg-brand-50 text-brand-800"
        }`}
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          {result.warning
            ? result.warning
            : result.activationEmailSent
              ? `auth_service confirmó el envío del correo de activación a ${user.email}.`
              : `La cuenta fue creada. auth_service no confirmó el envío del correo de activación a ${user.email}.`}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button onClick={onViewUser}>Ver usuario</Button>
        <Button variant="secondary" onClick={onCreateAnother}>
          Registrar otro usuario
        </Button>
      </div>
      <button
        type="button"
        onClick={onBackToList}
        className="mt-4 text-sm font-semibold text-[var(--ui-primary)] underline underline-offset-2"
      >
        Volver al listado
      </button>
    </section>
  );
}
