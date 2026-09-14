import { Eye, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminUserStatusBadge } from "@/features/system-administration/components/admin-user-status-badge";
import type { AdminUser } from "@/features/system-administration/model/admin-user.types";
import { getPermissionGroupPresentation } from "@/features/system-administration/model/system-access-presentation";

function groupSummary(user: AdminUser): string {
  if (!user.groups.length) return "Sin accesos";

  return user.groups
    .map((group) => {
      const presentation = getPermissionGroupPresentation(group.name);
      return presentation.scope
        ? `${presentation.title} (${presentation.scope})`
        : presentation.title;
    })
    .join(", ");
}

function ViewButton({
  user,
  onView,
  canView,
}: {
  user: AdminUser;
  onView: (id: string) => void;
  canView: boolean;
}) {
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => onView(user.id)}
      disabled={!canView}
      aria-label={`Ver detalle de ${user.fullName}`}
      title={canView ? "Ver detalle" : "No tienes VER_USUARIO_DETALLE"}
    >
      <Eye className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}

export function AdminUsersTable({
  users,
  onView,
  canView,
}: {
  users: AdminUser[];
  onView: (id: string) => void;
  canView: boolean;
}) {
  if (!users.length) {
    return (
      <Card>
        <EmptyState
          icon={UsersRound}
          title="No se encontraron usuarios"
          description="Ajusta los filtros o registra una nueva cuenta para continuar."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-3 p-4 xl:hidden" aria-label="Usuarios administrables">
        {users.map((user) => (
          <article
            key={user.id}
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words text-sm font-bold leading-5 text-[var(--ui-text-primary)]">
                  {user.fullName}
                </h3>
                <p className="mt-1 break-all text-xs text-[var(--ui-text-secondary)]">
                  {user.email}
                </p>
              </div>
              <ViewButton user={user} onView={onView} canView={canView} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">CURP</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700">{user.curp}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Estatus
                </p>
                <div className="mt-1">
                  <AdminUserStatusBadge status={user.status} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Instancia
                </p>
                <p className="mt-1 break-words text-xs font-semibold text-slate-700">
                  {user.instance}
                </p>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Sistemas y accesos
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                  {groupSummary(user)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Entidad
                </p>
                <p className="mt-1 break-words text-xs text-slate-600">{user.entity}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden min-w-0 xl:block">
        <table
          className="w-full table-fixed border-collapse text-left"
          aria-label="Usuarios administrables"
        >
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[13%]" />
            <col className="w-[20%]" />
            <col className="w-[11%]" />
            <col />
            <col className="w-[11%]" />
            <col className="w-[10%]" />
            <col className="w-[86px]" />
          </colgroup>
          <thead className="bg-slate-100/80 text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--ui-text-secondary)]">
            <tr>
              <th className="px-3 py-4">Usuario</th>
              <th className="px-3 py-4">CURP</th>
              <th className="px-3 py-4">Correo</th>
              <th className="px-3 py-4">Instancia</th>
              <th className="px-3 py-4">Sistemas / grupos</th>
              <th className="px-3 py-4">Estatus</th>
              <th className="px-3 py-4">Entidad</th>
              <th className="px-3 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-[var(--ui-border)] text-sm text-[var(--ui-text-primary)] transition-colors hover:bg-slate-50/70"
              >
                <td className="min-w-0 px-3 py-4 align-middle">
                  <p className="truncate font-semibold" title={user.fullName}>
                    {user.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--ui-text-secondary)]">
                    ID: {user.username}
                  </p>
                </td>
                <td className="truncate px-3 py-4 align-middle font-mono text-xs" title={user.curp}>
                  {user.curp}
                </td>
                <td className="truncate px-3 py-4 align-middle" title={user.email}>
                  {user.email}
                </td>
                <td className="truncate px-3 py-4 align-middle" title={user.instance}>
                  {user.instance}
                </td>
                <td className="min-w-0 px-3 py-4 align-middle">
                  <p
                    className="line-clamp-2 break-words text-xs leading-5 text-slate-600"
                    title={groupSummary(user)}
                  >
                    {groupSummary(user)}
                  </p>
                </td>
                <td className="px-3 py-4 align-middle">
                  <AdminUserStatusBadge status={user.status} />
                </td>
                <td className="truncate px-3 py-4 align-middle" title={user.entity}>
                  {user.entity}
                </td>
                <td className="px-3 py-4 text-center align-middle">
                  <ViewButton user={user} onView={onView} canView={canView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
